import { RxStomp, RxStompState } from '@stomp/rx-stomp';
import { Versions } from '@stomp/stompjs';
import Axios from 'axios';
import { encode } from 'base-64';
import { take } from 'rxjs/operators';
import { v4 } from 'uuid';
import { version } from './environment/version';
let TransportFallback;
import('sockjs-client')
    .then((sockjs) => {
    TransportFallback = sockjs;
})
    .catch((error) => {
    ErrorMessageTransportFallback.errorMessage = error.message;
    TransportFallback = { default: ErrorMessageTransportFallback };
});
class ErrorMessageTransportFallback {
    constructor() {
        throw new Error('Encountered error when attempting to use transport fallback: ' +
            ErrorMessageTransportFallback.errorMessage);
    }
}
export default class StompX {
    constructor(configuration) {
        this.topics = new Map();
        this.pendingActions = new Map();
        this.pendingRelayErrors = new Map();
        this.pendingActionErrors = new Map();
        this.eventHandlers = new Map();
        this.rxStomp = new RxStomp();
        this.initialized = false;
        this.host = configuration.host;
        if (configuration.isSecure) {
            this.wsScheme = 'wss';
            this.httpScheme = 'https';
        }
        else {
            this.wsScheme = 'ws';
            this.httpScheme = 'http';
        }
        this.rxStompConfig = {
            stompVersions: new Versions(['1.2']),
            connectionTimeout: 60000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 60000,
            debug: (message) => {
                if (configuration.isDebug) {
                    console.log('StompX Debug:\n' + message);
                }
            },
        };
        if (typeof navigator != 'undefined' && navigator.product == 'ReactNative') {
            this.rxStompConfig.forceBinaryWSFrames = true;
            this.rxStompConfig.appendMissingNULLonIncoming = true;
        }
        this.axios = Axios.create({
            baseURL: this.httpScheme + '://' + this.host,
        });
    }
    connect(request) {
        const host = this.host;
        const connectHeaders = {
            'StompX-User': request.username,
            'StompX-User-Agent': `ChatKitty-JS/${version}`,
        };
        if (request.authParams) {
            connectHeaders['StompX-Auth-Params'] = encode(JSON.stringify(request.authParams));
        }
        if (typeof WebSocket === 'function') {
            this.rxStompConfig.brokerURL = `${this.wsScheme}://${host}/rtm/websocket?api-key=${encodeURIComponent(request.apiKey)}`;
        }
        else {
            this.rxStompConfig.webSocketFactory = () => {
                return new TransportFallback.default(`${this.httpScheme}://${host}/rtm?api-key=${encodeURIComponent(request.apiKey)}`);
            };
        }
        this.rxStomp.configure(Object.assign(Object.assign({}, this.rxStompConfig), { connectHeaders }));
        this.rxStomp.serverHeaders$.subscribe(headers => {
            this.rxStomp.configure(Object.assign(Object.assign({}, this.rxStompConfig), { connectHeaders: Object.assign(Object.assign({}, connectHeaders), { 'StompX-Auth-Session-ID': headers['session'] }) }));
        });
        this.rxStomp.connected$.subscribe(() => {
            this.relayResource({
                destination: '/application/v1/user.relay',
                onSuccess: (user) => {
                    if (this.initialized) {
                        request.onConnected(user);
                    }
                    else {
                        this.rxStomp
                            .watch('/user/queue/v1/errors', {
                            id: StompX.generateSubscriptionId(),
                        })
                            .subscribe((message) => {
                            const error = JSON.parse(message.body);
                            const subscription = message.headers['subscription-id'];
                            const receipt = message.headers['receipt-id'];
                            if (subscription) {
                                const handler = this.pendingRelayErrors.get(subscription);
                                if (handler) {
                                    handler(error);
                                    this.pendingRelayErrors.delete(subscription);
                                }
                            }
                            if (receipt) {
                                const handler = this.pendingActionErrors.get(receipt);
                                if (handler) {
                                    handler(error);
                                    this.pendingActionErrors.delete(receipt);
                                }
                            }
                            if (!subscription && !receipt) {
                                this.pendingActionErrors.forEach((handler) => {
                                    handler(error);
                                });
                                this.pendingActionErrors.clear();
                            }
                        });
                        this.relayResource({
                            destination: '/application/v1/user.write_file_access_grant.relay',
                            onSuccess: (write) => {
                                this.relayResource({
                                    destination: '/application/v1/user.read_file_access_grant.relay',
                                    onSuccess: (read) => {
                                        request.onSuccess(user, write.grant, read.grant);
                                        request.onConnected(user);
                                        this.initialized = true;
                                    },
                                });
                            },
                        });
                    }
                },
            });
        });
        this.rxStomp.connectionState$.subscribe((state) => {
            if (state == RxStompState.CLOSED) {
                request.onConnectionLost();
            }
            if (state == RxStompState.OPEN) {
                request.onConnectionResumed();
            }
        });
        this.rxStomp.stompErrors$.subscribe((frame) => {
            let error;
            try {
                error = JSON.parse(frame.body);
            }
            catch (e) {
                error = {
                    error: 'UnknownChatKittyError',
                    message: 'An unknown error occurred.',
                    timestamp: new Date().toISOString(),
                };
            }
            if (error.error == 'AccessDeniedError') {
                const onResult = () => request.onError(error);
                this.disconnect({ onSuccess: onResult, onError: onResult });
            }
            else {
                request.onError(error);
            }
        });
        this.rxStomp.webSocketErrors$.subscribe((error) => {
            console.error(error);
            request.onError({
                error: 'ChatKittyConnectionError',
                message: 'Could not connect to ChatKitty',
                timestamp: new Date().toISOString(),
            });
        });
        this.rxStomp.activate();
    }
    relayResource(request) {
        this.guardConnected(() => {
            const subscriptionId = StompX.generateSubscriptionId();
            if (request.onError) {
                this.pendingRelayErrors.set(subscriptionId, request.onError);
            }
            this.rxStomp.stompClient.subscribe(request.destination, (message) => {
                request.onSuccess(JSON.parse(message.body).resource);
            }, Object.assign(Object.assign({}, request.parameters), { id: subscriptionId }));
        });
    }
    listenToTopic(request) {
        let unsubscribe = () => {
            // Do nothing
        };
        this.guardConnected(() => {
            const subscriptionReceipt = StompX.generateReceipt();
            const onSuccess = request.onSuccess;
            if (onSuccess) {
                this.rxStomp.watchForReceipt(subscriptionReceipt, () => {
                    onSuccess();
                });
            }
            const subscription = this.rxStomp
                .watch(request.topic, {
                id: StompX.generateSubscriptionId(),
                receipt: subscriptionReceipt,
                ack: 'client-individual',
            })
                .subscribe((message) => {
                const event = JSON.parse(message.body);
                const receipt = message.headers['receipt-id'];
                if (receipt) {
                    const action = this.pendingActions.get(receipt);
                    if (action && (!action.types || action.types.find(type => type === event.type))) {
                        action.action(event.resource);
                        this.pendingActions.delete(receipt);
                    }
                }
                const handlers = this.eventHandlers.get(request.topic);
                if (handlers) {
                    handlers.forEach((handler) => {
                        if (handler.event === event.type) {
                            handler.onSuccess(event.resource);
                        }
                    });
                }
                message.ack();
            });
            this.topics.set(request.topic, subscription);
            unsubscribe = () => {
                subscription.unsubscribe();
                this.topics.delete(request.topic);
            };
        });
        return () => unsubscribe();
    }
    listenForEvent(request) {
        let handlers = this.eventHandlers.get(request.topic);
        if (handlers === undefined) {
            handlers = new Set();
        }
        const handler = {
            event: request.event,
            onSuccess: request.onSuccess,
        };
        handlers.add(handler);
        this.eventHandlers.set(request.topic, handlers);
        return () => {
            if (handlers) {
                handlers.delete(handler);
            }
        };
    }
    sendAction(request) {
        this.guardConnected(() => {
            const receipt = StompX.generateReceipt();
            if (request.onSent) {
                this.rxStomp.watchForReceipt(receipt, request.onSent);
            }
            if (request.onSuccess) {
                this.pendingActions.set(receipt, {
                    types: request.events,
                    action: request.onSuccess
                });
            }
            if (request.onError) {
                this.pendingActionErrors.set(receipt, request.onError);
            }
            this.rxStomp.publish({
                destination: request.destination,
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                    receipt: receipt,
                },
                body: JSON.stringify(request.body),
            });
        });
    }
    sendToStream(request) {
        var _a, _b, _c;
        const data = new FormData();
        let file = request.file;
        if (!(file instanceof File)) {
            file = StompX.dataUriToFile(file.uri, file.name);
        }
        data.append('file', file);
        (_a = request.properties) === null || _a === void 0 ? void 0 : _a.forEach((value, key) => {
            data.append(key, JSON.stringify(value));
        });
        (_c = (_b = request.progressListener) === null || _b === void 0 ? void 0 : _b.onStarted) === null || _c === void 0 ? void 0 : _c.call(_b);
        this.axios({
            method: 'post',
            url: request.stream,
            data: data,
            headers: { 'Content-Type': 'multipart/form-data', Grant: request.grant },
            onUploadProgress: (progressEvent) => {
                var _a, _b;
                (_b = (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onProgress) === null || _b === void 0 ? void 0 : _b.call(_a, progressEvent.loaded / progressEvent.total);
            },
        })
            .then((response) => {
            var _a, _b, _c;
            (_b = (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted) === null || _b === void 0 ? void 0 : _b.call(_a);
            (_c = request.onSuccess) === null || _c === void 0 ? void 0 : _c.call(request, response.data);
        })
            .catch((error) => {
            var _a, _b, _c;
            (_b = (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onFailed) === null || _b === void 0 ? void 0 : _b.call(_a);
            (_c = request.onError) === null || _c === void 0 ? void 0 : _c.call(request, error);
        });
    }
    disconnect(request) {
        this.initialized = false;
        this.rxStomp.deactivate().then(request.onSuccess).catch(request.onError);
        this.rxStomp = new RxStomp();
    }
    guardConnected(action) {
        this.rxStomp.connected$.pipe(take(1)).subscribe(() => {
            action();
        });
    }
    static dataUriToFile(url, name) {
        var _a;
        const arr = url.split(','), mime = (_a = arr[0].match(/:(.*?);/)) === null || _a === void 0 ? void 0 : _a[1], bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], name, { type: mime });
    }
    static generateSubscriptionId() {
        return 'subscription-id-' + v4();
    }
    static generateReceipt() {
        return 'receipt-' + v4();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvbXB4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0b21weC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsT0FBTyxFQUFpQixZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNyRSxPQUFPLEVBQWUsUUFBUSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDdEQsT0FBTyxLQUFzQixNQUFNLE9BQU8sQ0FBQztBQUMzQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRWpDLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwQyxPQUFPLEVBQUMsRUFBRSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRXhCLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUU5QyxJQUFJLGlCQUE2RCxDQUFDO0FBRWxFLE1BQU0sQ0FBQyxlQUFlLENBQUM7S0FDcEIsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7SUFDZixpQkFBaUIsR0FBRyxNQUFNLENBQUM7QUFDN0IsQ0FBQyxDQUFDO0tBQ0QsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDZiw2QkFBNkIsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUUzRCxpQkFBaUIsR0FBRyxFQUFDLE9BQU8sRUFBRSw2QkFBNkIsRUFBQyxDQUFDO0FBQy9ELENBQUMsQ0FBQyxDQUFDO0FBRUwsTUFBTSw2QkFBNkI7SUFHakM7UUFDRSxNQUFNLElBQUksS0FBSyxDQUNiLCtEQUErRDtZQUMvRCw2QkFBNkIsQ0FBQyxZQUFZLENBQzNDLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFFRCxNQUFNLENBQUMsT0FBTyxPQUFPLE1BQU07SUFnQ3pCLFlBQVksYUFBa0M7UUFyQjdCLFdBQU0sR0FBOEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUU5QyxtQkFBYyxHQUl4QixJQUFJLEdBQUcs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