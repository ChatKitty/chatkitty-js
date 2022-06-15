"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var rx_stomp_1 = require("@stomp/rx-stomp");
var stompjs_1 = require("@stomp/stompjs");
var axios_1 = __importDefault(require("axios"));
var base_64_1 = require("base-64");
var operators_1 = require("rxjs/operators");
var uuid_1 = require("uuid");
var version_1 = require("./environment/version");
var TransportFallback;
Promise.resolve().then(function () { return __importStar(require('sockjs-client')); }).then(function (sockjs) {
    TransportFallback = sockjs;
})
    .catch(function (error) {
    ErrorMessageTransportFallback.errorMessage = error.message;
    TransportFallback = { default: ErrorMessageTransportFallback };
});
var ErrorMessageTransportFallback = /** @class */ (function () {
    function ErrorMessageTransportFallback() {
        throw new Error('Encountered error when attempting to use transport fallback: ' +
            ErrorMessageTransportFallback.errorMessage);
    }
    return ErrorMessageTransportFallback;
}());
var StompX = /** @class */ (function () {
    function StompX(configuration) {
        this.topics = new Map();
        this.pendingActions = new Map();
        this.pendingRelayErrors = new Map();
        this.pendingActionErrors = new Map();
        this.eventHandlers = new Map();
        this.rxStomp = new rx_stomp_1.RxStomp();
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
            stompVersions: new stompjs_1.Versions(['1.2']),
            connectionTimeout: 60000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 60000,
            debug: function (message) {
                if (configuration.isDebug) {
                    console.log('StompX Debug:\n' + message);
                }
            },
        };
        if (typeof navigator != 'undefined' && navigator.product == 'ReactNative') {
            this.rxStompConfig.forceBinaryWSFrames = true;
            this.rxStompConfig.appendMissingNULLonIncoming = true;
        }
        this.axios = axios_1.default.create({
            baseURL: this.httpScheme + '://' + this.host,
        });
    }
    StompX.prototype.connect = function (request) {
        var _this = this;
        var host = this.host;
        var connectHeaders = {
            'StompX-User': request.username,
            'StompX-User-Agent': "ChatKitty-JS/".concat(version_1.version),
        };
        if (request.authParams) {
            connectHeaders['StompX-Auth-Params'] = (0, base_64_1.encode)(JSON.stringify(request.authParams));
        }
        if (typeof WebSocket === 'function') {
            this.rxStompConfig.brokerURL = "".concat(this.wsScheme, "://").concat(host, "/rtm/websocket?api-key=").concat(encodeURIComponent(request.apiKey));
        }
        else {
            this.rxStompConfig.webSocketFactory = function () {
                return new TransportFallback.default("".concat(_this.httpScheme, "://").concat(host, "/rtm?api-key=").concat(encodeURIComponent(request.apiKey)));
            };
        }
        this.rxStomp.configure(__assign(__assign({}, this.rxStompConfig), { connectHeaders: connectHeaders }));
        this.rxStomp.serverHeaders$.subscribe(function (headers) {
            _this.rxStomp.configure(__assign(__assign({}, _this.rxStompConfig), { connectHeaders: __assign(__assign({}, connectHeaders), { 'StompX-Auth-Session-ID': headers['session'] }) }));
        });
        this.rxStomp.connected$.subscribe(function () {
            _this.relayResource({
                destination: '/application/v1/user.relay',
                onSuccess: function (user) {
                    if (_this.initialized) {
                        request.onConnected(user);
                    }
                    else {
                        _this.rxStomp
                            .watch('/user/queue/v1/errors', {
                            id: StompX.generateSubscriptionId(),
                        })
                            .subscribe(function (message) {
                            var error = JSON.parse(message.body);
                            var subscription = message.headers['subscription-id'];
                            var receipt = message.headers['receipt-id'];
                            if (subscription) {
                                var handler = _this.pendingRelayErrors.get(subscription);
                                if (handler) {
                                    handler(error);
                                    _this.pendingRelayErrors.delete(subscription);
                                }
                            }
                            if (receipt) {
                                var handler = _this.pendingActionErrors.get(receipt);
                                if (handler) {
                                    handler(error);
                                    _this.pendingActionErrors.delete(receipt);
                                }
                            }
                            if (!subscription && !receipt) {
                                _this.pendingActionErrors.forEach(function (handler) {
                                    handler(error);
                                });
                                _this.pendingActionErrors.clear();
                            }
                        });
                        _this.relayResource({
                            destination: '/application/v1/user.write_file_access_grant.relay',
                            onSuccess: function (write) {
                                _this.relayResource({
                                    destination: '/application/v1/user.read_file_access_grant.relay',
                                    onSuccess: function (read) {
                                        request.onSuccess(user, write.grant, read.grant);
                                        request.onConnected(user);
                                        _this.initialized = true;
                                    },
                                });
                            },
                        });
                    }
                },
            });
        });
        this.rxStomp.connectionState$.subscribe(function (state) {
            if (state == rx_stomp_1.RxStompState.CLOSED) {
                request.onConnectionLost();
            }
            if (state == rx_stomp_1.RxStompState.OPEN) {
                request.onConnectionResumed();
            }
        });
        this.rxStomp.stompErrors$.subscribe(function (frame) {
            var error;
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
                var onResult = function () { return request.onError(error); };
                _this.disconnect({ onSuccess: onResult, onError: onResult });
            }
            else {
                request.onError(error);
            }
        });
        this.rxStomp.webSocketErrors$.subscribe(function (error) {
            console.error(error);
            request.onError({
                error: 'ChatKittyConnectionError',
                message: 'Could not connect to ChatKitty',
                timestamp: new Date().toISOString(),
            });
        });
        this.rxStomp.activate();
    };
    StompX.prototype.relayResource = function (request) {
        var _this = this;
        this.guardConnected(function () {
            var subscriptionId = StompX.generateSubscriptionId();
            if (request.onError) {
                _this.pendingRelayErrors.set(subscriptionId, request.onError);
            }
            _this.rxStomp.stompClient.subscribe(request.destination, function (message) {
                request.onSuccess(JSON.parse(message.body).resource);
            }, __assign(__assign({}, request.parameters), { id: subscriptionId }));
        });
    };
    StompX.prototype.listenToTopic = function (request) {
        var _this = this;
        var unsubscribe = function () {
            // Do nothing
        };
        this.guardConnected(function () {
            var subscriptionReceipt = StompX.generateReceipt();
            var onSuccess = request.onSuccess;
            if (onSuccess) {
                _this.rxStomp.watchForReceipt(subscriptionReceipt, function () {
                    onSuccess();
                });
            }
            var subscription = _this.rxStomp
                .watch(request.topic, {
                id: StompX.generateSubscriptionId(),
                receipt: subscriptionReceipt,
                ack: 'client-individual',
            })
                .subscribe(function (message) {
                var event = JSON.parse(message.body);
                var receipt = message.headers['receipt-id'];
                if (receipt) {
                    var action = _this.pendingActions.get(receipt);
                    if (action && (!action.types || action.types.find(function (type) { return type === event.type; }))) {
                        action.action(event.resource);
                        _this.pendingActions.delete(receipt);
                    }
                }
                var handlers = _this.eventHandlers.get(request.topic);
                if (handlers) {
                    handlers.forEach(function (handler) {
                        if (handler.event === event.type) {
                            handler.onSuccess(event.resource);
                        }
                    });
                }
                message.ack();
            });
            _this.topics.set(request.topic, subscription);
            unsubscribe = function () {
                subscription.unsubscribe();
                _this.topics.delete(request.topic);
            };
        });
        return function () { return unsubscribe(); };
    };
    StompX.prototype.listenForEvent = function (request) {
        var handlers = this.eventHandlers.get(request.topic);
        if (handlers === undefined) {
            handlers = new Set();
        }
        var handler = {
            event: request.event,
            onSuccess: request.onSuccess,
        };
        handlers.add(handler);
        this.eventHandlers.set(request.topic, handlers);
        return function () {
            if (handlers) {
                handlers.delete(handler);
            }
        };
    };
    StompX.prototype.sendAction = function (request) {
        var _this = this;
        this.guardConnected(function () {
            var receipt = StompX.generateReceipt();
            if (request.onSent) {
                _this.rxStomp.watchForReceipt(receipt, request.onSent);
            }
            if (request.onSuccess) {
                _this.pendingActions.set(receipt, {
                    types: request.events,
                    action: request.onSuccess
                });
            }
            if (request.onError) {
                _this.pendingActionErrors.set(receipt, request.onError);
            }
            _this.rxStomp.publish({
                destination: request.destination,
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                    receipt: receipt,
                },
                body: JSON.stringify(request.body),
            });
        });
    };
    StompX.prototype.sendToStream = function (request) {
        var _a, _b, _c;
        var data = new FormData();
        var file = request.file;
        if (!(file instanceof File)) {
            file = StompX.dataUriToFile(file.uri, file.name);
        }
        data.append('file', file);
        (_a = request.properties) === null || _a === void 0 ? void 0 : _a.forEach(function (value, key) {
            data.append(key, JSON.stringify(value));
        });
        (_c = (_b = request.progressListener) === null || _b === void 0 ? void 0 : _b.onStarted) === null || _c === void 0 ? void 0 : _c.call(_b);
        this.axios({
            method: 'post',
            url: request.stream,
            data: data,
            headers: { 'Content-Type': 'multipart/form-data', Grant: request.grant },
            onUploadProgress: function (progressEvent) {
                var _a, _b;
                (_b = (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onProgress) === null || _b === void 0 ? void 0 : _b.call(_a, progressEvent.loaded / progressEvent.total);
            },
        })
            .then(function (response) {
            var _a, _b, _c;
            (_b = (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted) === null || _b === void 0 ? void 0 : _b.call(_a);
            (_c = request.onSuccess) === null || _c === void 0 ? void 0 : _c.call(request, response.data);
        })
            .catch(function (error) {
            var _a, _b, _c;
            (_b = (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onFailed) === null || _b === void 0 ? void 0 : _b.call(_a);
            (_c = request.onError) === null || _c === void 0 ? void 0 : _c.call(request, error);
        });
    };
    StompX.prototype.disconnect = function (request) {
        this.initialized = false;
        this.rxStomp.deactivate().then(request.onSuccess).catch(request.onError);
        this.rxStomp = new rx_stomp_1.RxStomp();
    };
    StompX.prototype.guardConnected = function (action) {
        this.rxStomp.connected$.pipe((0, operators_1.take)(1)).subscribe(function () {
            action();
        });
    };
    StompX.dataUriToFile = function (url, name) {
        var _a;
        var arr = url.split(','), mime = (_a = arr[0].match(/:(.*?);/)) === null || _a === void 0 ? void 0 : _a[1], bstr = atob(arr[1]);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], name, { type: mime });
    };
    StompX.generateSubscriptionId = function () {
        return 'subscription-id-' + (0, uuid_1.v4)();
    };
    StompX.generateReceipt = function () {
        return 'receipt-' + (0, uuid_1.v4)();
    };
    return StompX;
}());
exports.default = StompX;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvbXB4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0b21weC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0Q0FBcUU7QUFDckUsMENBQXNEO0FBQ3RELGdEQUEyQztBQUMzQyxtQ0FBaUM7QUFFakMsNENBQW9DO0FBQ3BDLDZCQUF3QjtBQUV4QixpREFBOEM7QUFFOUMsSUFBSSxpQkFBNkQsQ0FBQztBQUVsRSxpRUFBTyxlQUFlLE9BQ25CLElBQUksQ0FBQyxVQUFDLE1BQU07SUFDWCxpQkFBaUIsR0FBRyxNQUFNLENBQUM7QUFDN0IsQ0FBQyxDQUFDO0tBQ0QsS0FBSyxDQUFDLFVBQUMsS0FBSztJQUNYLDZCQUE2QixDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBRTNELGlCQUFpQixHQUFHLEVBQUMsT0FBTyxFQUFFLDZCQUE2QixFQUFDLENBQUM7QUFDL0QsQ0FBQyxDQUFDLENBQUM7QUFFTDtJQUdFO1FBQ0UsTUFBTSxJQUFJLEtBQUssQ0FDYiwrREFBK0Q7WUFDL0QsNkJBQTZCLENBQUMsWUFBWSxDQUMzQyxDQUFDO0lBQ0osQ0FBQztJQUNILG9DQUFDO0FBQUQsQ0FBQyxBQVRELElBU0M7QUFFRDtJQWdDRSxnQkFBWSxhQUFrQztRQXJCN0IsV0FBTSxHQUE4QixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTlDLG1CQUFjLEdBSXhCLElBQUksR0FBRyxFQUFFLENBQUM7UUFFQSx1QkFBa0IsR0FDRCxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTNCLHdCQUFtQixHQUNGLElBQUksR0FBRyxFQUFFLENBQUM7UUFFM0Isa0JBQWEsR0FDUSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRXhDLFlBQU8sR0FBWSxJQUFJLGtCQUFPLEVBQUUsQ0FBQztRQUVsQyxnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUd6QixJQUFJLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUM7UUFFL0IsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFO1lBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO1NBQzNCO2FBQU07WUFDTCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztTQUMxQjtRQUVELElBQUksQ0FBQyxhQUFhLEdBQUc7WUFDbkIsYUFBYSxFQUFFLElBQUksa0JBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BDLGlCQUFpQixFQUFFLEtBQUs7WUFDeEIsaUJBQWlCLEVBQUUsS0FBSztZQUN4QixpQkFBaUIsRUFBRSxLQUFLO1lBRXhCLEtBQUssRUFBRSxVQUFDLE9BQU87Z0JBQ2IsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFO29CQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxDQUFDO2lCQUMxQztZQUNILENBQUM7U0FDRixDQUFDO1FBRUYsSUFBSSxPQUFPLFNBQVMsSUFBSSxXQUFXLElBQUksU0FBUyxDQUFDLE9BQU8sSUFBSSxhQUFhLEVBQUU7WUFDekUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7WUFDOUMsSUFBSSxDQUFDLGFBQWEsQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUM7U0FDdkQ7UUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7WUFDeEIsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJO1NBQzdDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSx3QkFBTyxHQUFkLFVBQWtCLE9BQWdDO1FBQWxELGlCQTBKQztRQXpKQyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBRXZCLElBQU0sY0FBYyxHQUFpQjtZQUNuQyxhQUFhLEVBQUUsT0FBTyxDQUFDLFFBQVE7WUFDL0IsbUJBQW1CLEVBQUUsdUJBQWdCLGlCQUFPLENBQUU7U0FDL0MsQ0FBQztRQUVGLElBQUksT0FBTyxDQUFDLFVBQVUsRUFBRTtZQUN0QixjQUFjLENBQUMsb0JBQW9CLENBQUMsR0FBRyxJQUFBLGdCQUFNLEVBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztTQUNuRjtRQUVELElBQUksT0FBTyxTQUFTLEtBQUssVUFBVSxFQUFFO1lBQ25DLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxHQUFHLFVBQzdCLElBQUksQ0FBQyxRQUFRLGdCQUNULElBQUksb0NBQTBCLGtCQUFrQixDQUNwRCxPQUFPLENBQUMsTUFBTSxDQUNmLENBQUUsQ0FBQztTQUNMO2FBQU07WUFDTCxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixHQUFHO2dCQUNwQyxPQUFPLElBQUksaUJBQWlCLENBQUMsT0FBTyxDQUNsQyxVQUFHLEtBQUksQ0FBQyxVQUFVLGdCQUFNLElBQUksMEJBQWdCLGtCQUFrQixDQUM1RCxPQUFPLENBQUMsTUFBTSxDQUNmLENBQUUsQ0FDSixDQUFDO1lBQ0osQ0FBQyxDQUFDO1NBQ0g7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsdUJBQ2pCLElBQUksQ0FBQyxhQUFhLEtBQ3JCLGNBQWMsZ0JBQUEsSUFDZCxDQUFDO1FBRUgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLFVBQUEsT0FBTztZQUMzQyxLQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsdUJBQ2pCLEtBQUksQ0FBQyxhQUFhLEtBQ3JCLGNBQWMsd0JBQ1QsY0FBYyxLQUNqQix3QkFBd0IsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLE9BRTlDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztZQUNoQyxLQUFJLENBQUMsYUFBYSxDQUFJO2dCQUNwQixXQUFXLEVBQUUsNEJBQTRCO2dCQUN6QyxTQUFTLEVBQUUsVUFBQyxJQUFJO29CQUNkLElBQUksS0FBSSxDQUFDLFdBQVcsRUFBRTt3QkFDcEIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDM0I7eUJBQU07d0JBQ0wsS0FBSSxDQUFDLE9BQU87NkJBQ1QsS0FBSyxDQUFDLHVCQUF1QixFQUFFOzRCQUM5QixFQUFFLEVBQUUsTUFBTSxDQUFDLHNCQUFzQixFQUFFO3lCQUNwQyxDQUFDOzZCQUNELFNBQVMsQ0FBQyxVQUFDLE9BQU87NEJBQ2pCLElBQU0sS0FBSyxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFFcEQsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOzRCQUN4RCxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOzRCQUU5QyxJQUFJLFlBQVksRUFBRTtnQ0FDaEIsSUFBTSxPQUFPLEdBQUcsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQ0FFMUQsSUFBSSxPQUFPLEVBQUU7b0NBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO29DQUVmLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7aUNBQzlDOzZCQUNGOzRCQUVELElBQUksT0FBTyxFQUFFO2dDQUNYLElBQU0sT0FBTyxHQUFHLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0NBRXRELElBQUksT0FBTyxFQUFFO29DQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQ0FFZixLQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lDQUMxQzs2QkFDRjs0QkFFRCxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsT0FBTyxFQUFFO2dDQUM3QixLQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFVBQUMsT0FBTztvQ0FDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dDQUNqQixDQUFDLENBQUMsQ0FBQztnQ0FFSCxLQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7NkJBQ2xDO3dCQUNILENBQUMsQ0FBQyxDQUFDO3dCQUVMLEtBQUksQ0FBQyxhQUFhLENBQW9COzRCQUNwQyxXQUFXLEVBQ1Qsb0RBQW9EOzRCQUN0RCxTQUFTLEVBQUUsVUFBQyxLQUFLO2dDQUNmLEtBQUksQ0FBQyxhQUFhLENBQW9CO29DQUNwQyxXQUFXLEVBQ1QsbURBQW1EO29DQUNyRCxTQUFTLEVBQUUsVUFBQyxJQUFJO3dDQUNkLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dDQUVqRCxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO3dDQUUxQixLQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztvQ0FDMUIsQ0FBQztpQ0FDRixDQUFDLENBQUM7NEJBQ0wsQ0FBQzt5QkFDRixDQUFDLENBQUM7cUJBQ0o7Z0JBQ0gsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsVUFBQyxLQUFLO1lBQzVDLElBQUksS0FBSyxJQUFJLHVCQUFZLENBQUMsTUFBTSxFQUFFO2dCQUNoQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzthQUM1QjtZQUVELElBQUksS0FBSyxJQUFJLHVCQUFZLENBQUMsSUFBSSxFQUFFO2dCQUM5QixPQUFPLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzthQUMvQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQUMsS0FBSztZQUN4QyxJQUFJLEtBQWtCLENBQUM7WUFFdkIsSUFBSTtnQkFDRixLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDaEM7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixLQUFLLEdBQUc7b0JBQ04sS0FBSyxFQUFFLHVCQUF1QjtvQkFDOUIsT0FBTyxFQUFFLDRCQUE0QjtvQkFDckMsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO2lCQUNwQyxDQUFDO2FBQ0g7WUFFRCxJQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksbUJBQW1CLEVBQUU7Z0JBQ3RDLElBQU0sUUFBUSxHQUFHLGNBQU0sT0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUF0QixDQUFzQixDQUFDO2dCQUU5QyxLQUFJLENBQUMsVUFBVSxDQUFDLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQzthQUMzRDtpQkFBTTtnQkFDTCxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3hCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxVQUFDLEtBQUs7WUFDNUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVyQixPQUFPLENBQUMsT0FBTyxDQUFDO2dCQUNkLEtBQUssRUFBRSwwQkFBMEI7Z0JBQ2pDLE9BQU8sRUFBRSxnQ0FBZ0M7Z0JBQ3pDLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTthQUNwQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVNLDhCQUFhLEdBQXBCLFVBQXdCLE9BQXNDO1FBQTlELGlCQW1CQztRQWxCQyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQ2xCLElBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBRXZELElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtnQkFDbkIsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzlEO1lBRUQsS0FBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUNoQyxPQUFPLENBQUMsV0FBVyxFQUNuQixVQUFDLE9BQU87Z0JBQ04sT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RCxDQUFDLHdCQUVJLE9BQU8sQ0FBQyxVQUFVLEtBQ3JCLEVBQUUsRUFBRSxjQUFjLElBRXJCLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSw4QkFBYSxHQUFwQixVQUFxQixPQUFtQztRQUF4RCxpQkE0REM7UUEzREMsSUFBSSxXQUFXLEdBQUc7WUFDaEIsYUFBYTtRQUNmLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDbEIsSUFBTSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7WUFFckQsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztZQUVwQyxJQUFJLFNBQVMsRUFBRTtnQkFDYixLQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsRUFBRTtvQkFDaEQsU0FBUyxFQUFFLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUVELElBQU0sWUFBWSxHQUFHLEtBQUksQ0FBQyxPQUFPO2lCQUM5QixLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDcEIsRUFBRSxFQUFFLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRTtnQkFDbkMsT0FBTyxFQUFFLG1CQUFtQjtnQkFDNUIsR0FBRyxFQUFFLG1CQUFtQjthQUN6QixDQUFDO2lCQUNELFNBQVMsQ0FBQyxVQUFDLE9BQU87Z0JBQ2pCLElBQU0sS0FBSyxHQUF5QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFN0QsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFOUMsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsSUFBTSxNQUFNLEdBQUcsS0FBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBRWhELElBQUksTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLEVBQW5CLENBQW1CLENBQUMsQ0FBQyxFQUFFO3dCQUMvRSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFFOUIsS0FBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7cUJBQ3JDO2lCQUNGO2dCQUVELElBQU0sUUFBUSxHQUFHLEtBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFdkQsSUFBSSxRQUFRLEVBQUU7b0JBQ1osUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFDLE9BQU87d0JBQ3ZCLElBQUksT0FBTyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsSUFBSSxFQUFFOzRCQUNoQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzt5QkFDbkM7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7Z0JBRUQsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxDQUFDO1lBRUwsS0FBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztZQUU3QyxXQUFXLEdBQUc7Z0JBQ1osWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUUzQixLQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLGNBQU0sT0FBQSxXQUFXLEVBQUUsRUFBYixDQUFhLENBQUM7SUFDN0IsQ0FBQztJQUVNLCtCQUFjLEdBQXJCLFVBQ0UsT0FBdUM7UUFFdkMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXJELElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtZQUMxQixRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQStCLENBQUM7U0FDbkQ7UUFFRCxJQUFNLE9BQU8sR0FBRztZQUNkLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztZQUNwQixTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQXdDO1NBQzVELENBQUM7UUFFRixRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXRCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFaEQsT0FBTztZQUNMLElBQUksUUFBUSxFQUFFO2dCQUNaLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDMUI7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRU0sMkJBQVUsR0FBakIsVUFBcUIsT0FBbUM7UUFBeEQsaUJBK0JDO1FBOUJDLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDbEIsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXpDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDbEIsS0FBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN2RDtZQUVELElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtnQkFDckIsS0FBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQ3JCLE9BQU8sRUFDUDtvQkFDRSxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU07b0JBQ3JCLE1BQU0sRUFBRSxPQUFPLENBQUMsU0FBd0M7aUJBQ3pELENBQ0YsQ0FBQzthQUNIO1lBRUQsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFO2dCQUNuQixLQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDeEQ7WUFFRCxLQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFDbkIsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO2dCQUNoQyxPQUFPLEVBQUU7b0JBQ1AsY0FBYyxFQUFFLGdDQUFnQztvQkFDaEQsT0FBTyxFQUFFLE9BQU87aUJBQ2pCO2dCQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7YUFDbkMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sNkJBQVksR0FBbkIsVUFBdUIsT0FBcUM7O1FBQzFELElBQU0sSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7UUFFNUIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUV4QixJQUFJLENBQUMsQ0FBQyxJQUFJLFlBQVksSUFBSSxDQUFDLEVBQUU7WUFDM0IsSUFBSSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbEQ7UUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUxQixNQUFBLE9BQU8sQ0FBQyxVQUFVLDBDQUFFLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBRSxHQUFHO1lBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztRQUVILE1BQUEsTUFBQSxPQUFPLENBQUMsZ0JBQWdCLDBDQUFFLFNBQVMsa0RBQUksQ0FBQztRQUV4QyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ1QsTUFBTSxFQUFFLE1BQU07WUFDZCxHQUFHLEVBQUUsT0FBTyxDQUFDLE1BQU07WUFDbkIsSUFBSSxFQUFFLElBQUk7WUFDVixPQUFPLEVBQUUsRUFBQyxjQUFjLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUM7WUFDdEUsZ0JBQWdCLEVBQUUsVUFBQyxhQUFhOztnQkFDOUIsTUFBQSxNQUFBLE9BQU8sQ0FBQyxnQkFBZ0IsMENBQUUsVUFBVSxtREFDbEMsYUFBYSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUMsS0FBSyxDQUMzQyxDQUFDO1lBQ0osQ0FBQztTQUNGLENBQUM7YUFDQyxJQUFJLENBQUMsVUFBQyxRQUFROztZQUNiLE1BQUEsTUFBQSxPQUFPLENBQUMsZ0JBQWdCLDBDQUFFLFdBQVcsa0RBQUksQ0FBQztZQUUxQyxNQUFBLE9BQU8sQ0FBQyxTQUFTLHdEQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDLENBQUM7YUFDRCxLQUFLLENBQUMsVUFBQyxLQUFLOztZQUNYLE1BQUEsTUFBQSxPQUFPLENBQUMsZ0JBQWdCLDBDQUFFLFFBQVEsa0RBQUksQ0FBQztZQUV2QyxNQUFBLE9BQU8sQ0FBQyxPQUFPLHdEQUFHLEtBQUssQ0FBQyxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLDJCQUFVLEdBQWpCLFVBQWtCLE9BQWdDO1FBQ2hELElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBRXpCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXpFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxrQkFBTyxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVPLCtCQUFjLEdBQXRCLFVBQXVCLE1BQWtCO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFBLGdCQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDOUMsTUFBTSxFQUFFLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFYyxvQkFBYSxHQUE1QixVQUE2QixHQUFXLEVBQUUsSUFBWTs7UUFDcEQsSUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsTUFBQSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQywwQ0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJGLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFcEIsSUFBTSxLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFL0IsT0FBTSxDQUFDLEVBQUUsRUFBQztZQUNSLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQy9CO1FBRUQsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFYyw2QkFBc0IsR0FBckM7UUFDRSxPQUFPLGtCQUFrQixHQUFHLElBQUEsU0FBRSxHQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVjLHNCQUFlLEdBQTlCO1FBQ0UsT0FBTyxVQUFVLEdBQUcsSUFBQSxTQUFFLEdBQUUsQ0FBQztJQUMzQixDQUFDO0lBQ0gsYUFBQztBQUFELENBQUMsQUF0YkQsSUFzYkMifQ==