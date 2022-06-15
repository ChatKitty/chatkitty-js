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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatKittyImpl = void 0;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var environment_1 = require("../environment/environment");
var stompx_1 = __importDefault(require("../stompx"));
var channel_1 = require("./channel");
var chat_session_1 = require("./chat-session");
var current_user_1 = require("./current-user");
var event_1 = require("./event");
var file_1 = require("./file");
var message_1 = require("./message");
var pagination_1 = require("./pagination");
var reaction_1 = require("./reaction");
var read_receipt_1 = require("./read-receipt");
var result_1 = require("./result");
var thread_1 = require("./thread");
var user_1 = require("./user");
var user_block_list_item_1 = require("./user-block-list-item");
var user_session_1 = require("./user-session");
var ChatKittyImpl = /** @class */ (function () {
    function ChatKittyImpl(configuration) {
        var _this = this;
        this.configuration = configuration;
        this.currentUserSubject = new rxjs_1.BehaviorSubject(null);
        this.lostConnectionSubject = new rxjs_1.Subject();
        this.resumedConnectionSubject = new rxjs_1.Subject();
        this.chatSessions = new Map();
        this.messageMapper = new MessageMapper('');
        this.keyStrokesSubject = new rxjs_1.Subject();
        this.stompX = new stompx_1.default({
            isSecure: configuration.isSecure === undefined || configuration.isSecure,
            host: configuration.host || 'api.chatkitty.com',
            isDebug: !environment_1.environment.production,
        });
        this.keyStrokesSubject
            .asObservable()
            .pipe((0, operators_1.debounceTime)(150))
            .subscribe(function (request) {
            var destination = '';
            var channel = request.channel;
            var thread = request.thread;
            if (channel) {
                destination = channel._actions.keystrokes;
            }
            if (thread) {
                destination = thread._actions.keystrokes;
            }
            _this.stompX.sendAction({
                destination: destination,
                body: {
                    keys: request.keys,
                },
            });
        });
    }
    ChatKittyImpl.getInstance = function (apiKey) {
        var instance = ChatKittyImpl._instances.get(apiKey);
        if (instance !== undefined) {
            return instance;
        }
        instance = new ChatKittyImpl({ apiKey: apiKey });
        ChatKittyImpl._instances.set(apiKey, instance);
        return instance;
    };
    ChatKittyImpl.channelRelay = function (id) {
        return '/application/v1/channels/' + id + '.relay';
    };
    ChatKittyImpl.userRelay = function (id) {
        return '/application/v1/users/' + id + '.relay';
    };
    ChatKittyImpl.prototype.startSession = function (request) {
        var _this = this;
        if (this.stompX.initialized) {
            throw new user_session_1.SessionActiveError();
        }
        return new Promise(function (resolve) {
            _this.stompX.connect({
                apiKey: _this.configuration.apiKey,
                username: request.username,
                authParams: request.authParams,
                onSuccess: function (user, writeFileGrant, readFileGrant) {
                    _this.stompX.listenToTopic({ topic: user._topics.self });
                    _this.stompX.listenToTopic({ topic: user._topics.channels });
                    _this.stompX.listenToTopic({ topic: user._topics.messages });
                    _this.stompX.listenToTopic({ topic: user._topics.notifications });
                    _this.stompX.listenToTopic({ topic: user._topics.contacts });
                    _this.stompX.listenToTopic({ topic: user._topics.participants });
                    _this.stompX.listenToTopic({ topic: user._topics.users });
                    _this.stompX.listenToTopic({ topic: user._topics.reactions });
                    _this.stompX.listenToTopic({ topic: user._topics.threads });
                    _this.stompX.listenToTopic({ topic: user._topics.calls });
                    _this.writeFileGrant = writeFileGrant;
                    _this.messageMapper = new MessageMapper(readFileGrant);
                    resolve(new user_session_1.StartedSessionResult({ user: user }));
                },
                onConnected: function (user) {
                    _this.currentUser = user;
                    _this.currentUserSubject.next(user);
                },
                onConnectionLost: function () { return _this.lostConnectionSubject.next(); },
                onConnectionResumed: function () { return _this.resumedConnectionSubject.next(); },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.endSession = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.stompX.disconnect({
                onSuccess: function () {
                    _this.currentUser = undefined;
                    _this.currentUserSubject.next(null);
                    resolve();
                },
                onError: function (e) {
                    reject(e);
                },
            });
        });
    };
    ChatKittyImpl.prototype.getCurrentUser = function () {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            _this.stompX.relayResource({
                destination: currentUser._relays.self,
                onSuccess: function (user) {
                    resolve(new current_user_1.GetCurrentUserSuccessfulResult(user));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.onCurrentUserChanged = function (onNextOrObserver) {
        var subscription = this.currentUserSubject.subscribe(function (user) {
            if (typeof onNextOrObserver === 'function') {
                onNextOrObserver(user);
            }
            else {
                onNextOrObserver.onNext(user);
            }
        });
        return function () { return subscription.unsubscribe(); };
    };
    ChatKittyImpl.prototype.onCurrentUserOnline = function (onNextOrObserver) {
        var _this = this;
        var subscription = this.resumedConnectionSubject.subscribe(function () {
            if (typeof onNextOrObserver === 'function') {
                onNextOrObserver();
            }
            else {
                if (_this.currentUser) {
                    onNextOrObserver.onNext(_this.currentUser);
                }
            }
        });
        return function () { return subscription.unsubscribe(); };
    };
    ChatKittyImpl.prototype.onCurrentUserOffline = function (onNextOrObserver) {
        var _this = this;
        var subscription = this.lostConnectionSubject.subscribe(function () {
            if (typeof onNextOrObserver === 'function') {
                onNextOrObserver();
            }
            else {
                if (_this.currentUser) {
                    onNextOrObserver.onNext(_this.currentUser);
                }
            }
        });
        return function () { return subscription.unsubscribe(); };
    };
    ChatKittyImpl.prototype.updateCurrentUser = function (update) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: currentUser._actions.update,
                body: update(currentUser),
                onSuccess: function (user) {
                    _this.currentUserSubject.next(user);
                    resolve(new current_user_1.UpdatedCurrentUserResult(user));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.updateCurrentUserDisplayPicture = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            var file = request.file;
            if (file.uri) {
                _this.stompX.sendToStream({
                    stream: currentUser._streams.displayPicture,
                    grant: _this.writeFileGrant,
                    file: file,
                    onSuccess: function (user) {
                        resolve(new current_user_1.UpdatedCurrentUserDisplayPictureResult(user));
                    },
                    onError: function (error) {
                        resolve(new result_1.ChatKittyFailedResult(error));
                    },
                    progressListener: {
                        onStarted: function () { var _a, _b; return (_b = (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onStarted) === null || _b === void 0 ? void 0 : _b.call(_a); },
                        onProgress: function (progress) { var _a; return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onProgress(progress); },
                        onCompleted: function () {
                            var _a;
                            return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted(file_1.ChatKittyUploadResult.COMPLETED);
                        },
                        onFailed: function () {
                            var _a;
                            return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted(file_1.ChatKittyUploadResult.FAILED);
                        },
                        onCancelled: function () {
                            var _a;
                            return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted(file_1.ChatKittyUploadResult.CANCELLED);
                        },
                    },
                });
            }
            else {
                _this.stompX.sendAction({
                    destination: currentUser._actions.updateDisplayPicture,
                    body: file,
                    onSuccess: function (user) {
                        resolve(new current_user_1.UpdatedCurrentUserResult(user));
                    },
                    onError: function (error) {
                        resolve(new result_1.ChatKittyFailedResult(error));
                    },
                });
            }
        });
    };
    ChatKittyImpl.prototype.updateChannel = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.channel._actions.update,
                body: request.channel,
                onSuccess: function (channel) {
                    resolve(new channel_1.UpdatedChannelResult(channel));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.deleteChannel = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.channel._actions.delete,
                body: {},
                onSuccess: function () {
                    resolve(new channel_1.DeletedChannelResult());
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.createChannel = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: currentUser._actions.createChannel,
                events: ['user.channel.created', 'user.channel.upserted', 'member.channel.upserted'],
                body: request,
                onSuccess: function (channel) {
                    resolve(new channel_1.CreatedChannelResult(channel));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.getChannels = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            var _a, _b, _c, _d;
            var parameters = {};
            var relay = currentUser._relays.channels;
            if (isGetChannelsRequest(request)) {
                if (((_a = request.filter) === null || _a === void 0 ? void 0 : _a.joined) === false) {
                    relay = currentUser._relays.joinableChannels;
                }
                if (((_b = request.filter) === null || _b === void 0 ? void 0 : _b.joined) === true) {
                    parameters.subscribable = true;
                }
                if ((_c = request.filter) === null || _c === void 0 ? void 0 : _c.unread) {
                    relay = currentUser._relays.unreadChannels;
                }
            }
            var name = (_d = request === null || request === void 0 ? void 0 : request.filter) === null || _d === void 0 ? void 0 : _d.name;
            if (name) {
                parameters.name = name;
            }
            pagination_1.ChatKittyPaginator.createInstance({
                stompX: _this.stompX,
                relay: relay,
                contentName: 'channels',
                parameters: parameters,
            })
                .then(function (paginator) { return resolve(new channel_1.GetChannelsSucceededResult(paginator)); })
                .catch(function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); });
        });
    };
    ChatKittyImpl.prototype.getChannel = function (id) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.relayResource({
                destination: ChatKittyImpl.channelRelay(id),
                onSuccess: function (channel) {
                    resolve(new channel_1.GetChannelSucceededResult(channel));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.joinChannel = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var destination = request.channel._actions.join;
        if (!destination) {
            throw new channel_1.ChannelNotPubliclyJoinableError(request.channel);
        }
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: destination,
                body: request,
                onSuccess: function (channel) {
                    resolve(new channel_1.JoinedChannelResult(channel));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.leaveChannel = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var destination = request.channel._actions.leave;
        if (!destination) {
            throw new channel_1.NotAChannelMemberError(request.channel);
        }
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: destination,
                body: {},
                onSuccess: function (channel) {
                    resolve(new channel_1.LeftChannelResult(channel));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.addChannelModerator = function (request) {
        var _this = this;
        var destination = request.channel._actions.addModerator;
        if (!destination) {
            throw new channel_1.CannotAddModeratorToChannelError(request.channel);
        }
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: destination,
                body: request.user,
                onSuccess: function (channel) {
                    resolve(new channel_1.AddedChannelModeratorResult(channel));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.getUnreadChannelsCount = function (request) {
        var _this = this;
        var _a;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var parameters = {
            unread: true,
        };
        if (isGetChannelsUnreadRequest(request)) {
            parameters.type = (_a = request.filter) === null || _a === void 0 ? void 0 : _a.type;
        }
        return new Promise(function (resolve) {
            _this.stompX.relayResource({
                destination: currentUser._relays.channelsCount,
                parameters: parameters,
                onSuccess: function (resource) {
                    resolve(new result_1.GetCountSucceedResult(resource.count));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.getChannelUnread = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            _this.stompX.relayResource({
                destination: request.channel._relays.unread,
                onSuccess: function (resource) {
                    resolve(new channel_1.GetChannelUnreadSucceededResult(resource.exists));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.readChannel = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.channel._actions.read,
                body: {},
                onSent: function () { return resolve(new channel_1.ReadChannelSucceededResult(request.channel)); },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.muteChannel = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.channel._actions.mute,
                body: {
                    state: 'ON',
                },
                onSuccess: function (channel) {
                    resolve(new channel_1.MutedChannelResult(channel));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.unmuteChannel = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.channel._actions.mute,
                body: {
                    state: 'OFF',
                },
                onSuccess: function (channel) {
                    resolve(new channel_1.UnmutedChannelResult(channel));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.clearChannelHistory = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.channel._actions.clearHistory,
                body: {},
                onSuccess: function (channel) {
                    return resolve(new channel_1.ClearChannelHistorySucceededResult(channel));
                },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.hideChannel = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.channel._actions.hide,
                body: {},
                onSuccess: function (resource) {
                    return resolve(new channel_1.HideChannelSucceededResult(resource));
                },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.startChatSession = function (request) {
        var _this = this;
        var onReceivedMessage = request.onReceivedMessage;
        var onReceivedKeystrokes = request.onReceivedKeystrokes;
        var onParticipantEnteredChat = request.onParticipantEnteredChat;
        var onParticipantLeftChat = request.onParticipantLeftChat;
        var onTypingStarted = request.onTypingStarted;
        var onTypingStopped = request.onTypingStopped;
        var onParticipantPresenceChanged = request.onParticipantPresenceChanged;
        var onEventTriggered = request.onEventTriggered;
        var onMessageUpdated = request.onMessageUpdated;
        var onChannelUpdated = request.onChannelUpdated;
        var onMessageRead = request.onMessageRead;
        var onMessageReactionAdded = request.onMessageReactionAdded;
        var onMessageReactionRemoved = request.onMessageReactionRemoved;
        var onThreadReceivedMessage = request.onThreadReceivedMessage;
        var onThreadReceivedKeystrokes = request.onThreadReceivedKeystrokes;
        var onThreadTypingStarted = request.onThreadTypingStarted;
        var onThreadTypingStopped = request.onThreadTypingStopped;
        var receivedMessageUnsubscribe;
        var receivedKeystrokesUnsubscribe;
        var participantEnteredChatUnsubscribe;
        var participantLeftChatUnsubscribe;
        var typingStartedUnsubscribe;
        var typingStoppedUnsubscribe;
        var participantPresenceChangedUnsubscribe;
        var eventTriggeredUnsubscribe;
        var messageUpdatedUnsubscribe;
        var channelUpdatedUnsubscribe;
        var messageReadUnsubscribe;
        var messageReactionAddedUnsubscribe;
        var messageReactionRemovedUnsubscribe;
        var threadReceivedMessageUnsubscribe;
        var threadReceivedKeystrokesUnsubscribe;
        var threadTypingStartedUnsubscribe;
        var threadTypingStoppedUnsubscribe;
        if (onReceivedMessage) {
            receivedMessageUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.messages,
                event: 'channel.message.created',
                onSuccess: function (message) {
                    var destination = message._relays.parent;
                    if (destination) {
                        _this.stompX.relayResource({
                            destination: destination,
                            onSuccess: function (parent) {
                                onReceivedMessage(_this.messageMapper.map(message), _this.messageMapper.map(parent));
                            },
                        });
                    }
                    else {
                        onReceivedMessage(_this.messageMapper.map(message));
                    }
                },
            });
        }
        if (onReceivedKeystrokes) {
            receivedKeystrokesUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.keystrokes,
                event: 'thread.keystrokes.created',
                onSuccess: function (keystrokes) {
                    onReceivedKeystrokes(keystrokes);
                },
            });
        }
        if (onTypingStarted) {
            typingStartedUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.typing,
                event: 'thread.typing.started',
                onSuccess: function (user) {
                    onTypingStarted(user);
                },
            });
        }
        if (onTypingStopped) {
            typingStoppedUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.typing,
                event: 'thread.typing.stopped',
                onSuccess: function (user) {
                    onTypingStopped(user);
                },
            });
        }
        if (onParticipantEnteredChat) {
            participantEnteredChatUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.participants,
                event: 'channel.participant.active',
                onSuccess: function (user) {
                    onParticipantEnteredChat(user);
                },
            });
        }
        if (onParticipantLeftChat) {
            participantLeftChatUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.participants,
                event: 'channel.participant.inactive',
                onSuccess: function (user) {
                    onParticipantLeftChat(user);
                },
            });
        }
        if (onParticipantPresenceChanged) {
            participantPresenceChangedUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.participants,
                event: 'participant.presence.changed',
                onSuccess: function (user) {
                    onParticipantPresenceChanged(user);
                },
            });
        }
        if (onMessageUpdated) {
            messageUpdatedUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.messages,
                event: 'channel.message.updated',
                onSuccess: function (message) {
                    onMessageUpdated(message);
                },
            });
        }
        if (onEventTriggered) {
            eventTriggeredUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.events,
                event: 'channel.event.triggered',
                onSuccess: function (event) {
                    onEventTriggered(event);
                },
            });
        }
        if (onChannelUpdated) {
            channelUpdatedUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.self,
                event: 'channel.self.updated',
                onSuccess: function (channel) {
                    onChannelUpdated(channel);
                },
            });
        }
        if (onMessageRead) {
            messageReadUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.readReceipts,
                event: 'message.read_receipt.created',
                onSuccess: function (receipt) {
                    _this.stompX.relayResource({
                        destination: receipt._relays.message,
                        onSuccess: function (message) {
                            onMessageRead(message, receipt);
                        },
                    });
                },
            });
        }
        if (onMessageReactionAdded) {
            messageReactionAddedUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.reactions,
                event: 'message.reaction.created',
                onSuccess: function (reaction) {
                    _this.stompX.relayResource({
                        destination: reaction._relays.message,
                        onSuccess: function (message) {
                            onMessageReactionAdded(message, reaction);
                        },
                    });
                },
            });
        }
        if (onMessageReactionRemoved) {
            messageReactionRemovedUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.reactions,
                event: 'message.reaction.removed',
                onSuccess: function (reaction) {
                    _this.stompX.relayResource({
                        destination: reaction._relays.message,
                        onSuccess: function (message) {
                            onMessageReactionRemoved(message, reaction);
                        },
                    });
                },
            });
        }
        var end = function () {
            messageReactionRemovedUnsubscribe === null || messageReactionRemovedUnsubscribe === void 0 ? void 0 : messageReactionRemovedUnsubscribe();
            messageReactionAddedUnsubscribe === null || messageReactionAddedUnsubscribe === void 0 ? void 0 : messageReactionAddedUnsubscribe();
            messageReadUnsubscribe === null || messageReadUnsubscribe === void 0 ? void 0 : messageReadUnsubscribe();
            channelUpdatedUnsubscribe === null || channelUpdatedUnsubscribe === void 0 ? void 0 : channelUpdatedUnsubscribe();
            messageUpdatedUnsubscribe === null || messageUpdatedUnsubscribe === void 0 ? void 0 : messageUpdatedUnsubscribe();
            eventTriggeredUnsubscribe === null || eventTriggeredUnsubscribe === void 0 ? void 0 : eventTriggeredUnsubscribe();
            participantPresenceChangedUnsubscribe === null || participantPresenceChangedUnsubscribe === void 0 ? void 0 : participantPresenceChangedUnsubscribe();
            participantLeftChatUnsubscribe === null || participantLeftChatUnsubscribe === void 0 ? void 0 : participantLeftChatUnsubscribe();
            participantEnteredChatUnsubscribe === null || participantEnteredChatUnsubscribe === void 0 ? void 0 : participantEnteredChatUnsubscribe();
            typingStoppedUnsubscribe === null || typingStoppedUnsubscribe === void 0 ? void 0 : typingStoppedUnsubscribe();
            typingStartedUnsubscribe === null || typingStartedUnsubscribe === void 0 ? void 0 : typingStartedUnsubscribe();
            receivedKeystrokesUnsubscribe === null || receivedKeystrokesUnsubscribe === void 0 ? void 0 : receivedKeystrokesUnsubscribe();
            receivedMessageUnsubscribe === null || receivedMessageUnsubscribe === void 0 ? void 0 : receivedMessageUnsubscribe();
            threadReceivedMessageUnsubscribe === null || threadReceivedMessageUnsubscribe === void 0 ? void 0 : threadReceivedMessageUnsubscribe();
            threadReceivedKeystrokesUnsubscribe === null || threadReceivedKeystrokesUnsubscribe === void 0 ? void 0 : threadReceivedKeystrokesUnsubscribe();
            threadTypingStartedUnsubscribe === null || threadTypingStartedUnsubscribe === void 0 ? void 0 : threadTypingStartedUnsubscribe();
            threadTypingStoppedUnsubscribe === null || threadTypingStoppedUnsubscribe === void 0 ? void 0 : threadTypingStoppedUnsubscribe();
        };
        var channelUnsubscribe = this.stompX.listenToTopic({
            topic: request.channel._topics.self,
            onSuccess: function () {
                var messagesUnsubscribe = _this.stompX.listenToTopic({
                    topic: request.channel._topics.messages,
                });
                var keystrokesUnsubscribe = _this.stompX.listenToTopic({
                    topic: request.channel._topics.keystrokes,
                });
                var typingUnsubscribe = _this.stompX.listenToTopic({
                    topic: request.channel._topics.typing,
                });
                var participantsUnsubscribe = _this.stompX.listenToTopic({
                    topic: request.channel._topics.participants,
                });
                var readReceiptsUnsubscribe = _this.stompX.listenToTopic({
                    topic: request.channel._topics.readReceipts,
                });
                var reactionsUnsubscribe = _this.stompX.listenToTopic({
                    topic: request.channel._topics.reactions,
                });
                var eventsUnsubscribe = _this.stompX.listenToTopic({
                    topic: request.channel._topics.events,
                });
                var superEnd = end;
                end = function () {
                    superEnd();
                    eventsUnsubscribe === null || eventsUnsubscribe === void 0 ? void 0 : eventsUnsubscribe();
                    reactionsUnsubscribe === null || reactionsUnsubscribe === void 0 ? void 0 : reactionsUnsubscribe();
                    readReceiptsUnsubscribe === null || readReceiptsUnsubscribe === void 0 ? void 0 : readReceiptsUnsubscribe();
                    participantsUnsubscribe === null || participantsUnsubscribe === void 0 ? void 0 : participantsUnsubscribe();
                    typingUnsubscribe === null || typingUnsubscribe === void 0 ? void 0 : typingUnsubscribe();
                    keystrokesUnsubscribe === null || keystrokesUnsubscribe === void 0 ? void 0 : keystrokesUnsubscribe();
                    messagesUnsubscribe === null || messagesUnsubscribe === void 0 ? void 0 : messagesUnsubscribe();
                    channelUnsubscribe();
                    _this.chatSessions.delete(request.channel.id);
                };
            },
        });
        var activeThread = null;
        var session = {
            channel: request.channel,
            thread: activeThread,
            end: function () { return end(); },
            setThread: function (thread) {
                threadReceivedMessageUnsubscribe === null || threadReceivedMessageUnsubscribe === void 0 ? void 0 : threadReceivedMessageUnsubscribe();
                threadReceivedKeystrokesUnsubscribe === null || threadReceivedKeystrokesUnsubscribe === void 0 ? void 0 : threadReceivedKeystrokesUnsubscribe();
                threadTypingStartedUnsubscribe === null || threadTypingStartedUnsubscribe === void 0 ? void 0 : threadTypingStartedUnsubscribe();
                threadTypingStoppedUnsubscribe === null || threadTypingStoppedUnsubscribe === void 0 ? void 0 : threadTypingStoppedUnsubscribe();
                if (onThreadReceivedMessage) {
                    threadReceivedMessageUnsubscribe = _this.stompX.listenForEvent({
                        topic: thread._topics.messages,
                        event: 'thread.message.created',
                        onSuccess: function (message) {
                            onThreadReceivedMessage(thread, _this.messageMapper.map(message));
                        },
                    });
                }
                if (onThreadReceivedKeystrokes) {
                    threadReceivedKeystrokesUnsubscribe = _this.stompX.listenForEvent({
                        topic: thread._topics.keystrokes,
                        event: 'thread.keystrokes.created',
                        onSuccess: function (keystrokes) {
                            onThreadReceivedKeystrokes(thread, keystrokes);
                        },
                    });
                }
                if (onThreadTypingStarted) {
                    threadTypingStartedUnsubscribe = _this.stompX.listenForEvent({
                        topic: thread._topics.typing,
                        event: 'thread.typing.started',
                        onSuccess: function (user) {
                            onThreadTypingStarted(thread, user);
                        },
                    });
                }
                if (onThreadTypingStopped) {
                    threadTypingStoppedUnsubscribe = _this.stompX.listenForEvent({
                        topic: thread._topics.typing,
                        event: 'thread.typing.stopped',
                        onSuccess: function (user) {
                            onThreadTypingStopped(thread, user);
                        },
                    });
                }
                activeThread = thread;
            },
        };
        this.chatSessions.set(request.channel.id, session);
        return new chat_session_1.StartedChatSessionResult(session);
    };
    ChatKittyImpl.prototype.sendMessage = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            var destination = '';
            var stream = '';
            var sendChannelMessageRequest = request;
            if (sendChannelMessageRequest.channel !== undefined) {
                destination = sendChannelMessageRequest.channel._actions.message;
                stream = sendChannelMessageRequest.channel._streams.messages;
            }
            var sendMessageReplyRequest = request;
            if (sendMessageReplyRequest.message !== undefined) {
                destination = sendMessageReplyRequest.message._actions.reply;
                stream = sendMessageReplyRequest.message._streams.replies;
            }
            var sendThreadMessageRequest = request;
            if (sendThreadMessageRequest.thread !== undefined) {
                destination = sendThreadMessageRequest.thread._actions.message;
                stream = sendThreadMessageRequest.thread._streams.messages;
            }
            if (isSendChannelTextMessageRequest(request)) {
                _this.stompX.sendAction({
                    destination: destination,
                    body: {
                        type: 'TEXT',
                        body: request.body,
                        groupTag: request.groupTag,
                        properties: request.properties,
                    },
                    onSuccess: function (message) {
                        resolve(new message_1.SentTextMessageResult(_this.messageMapper.map(message)));
                    },
                    onError: function (error) {
                        resolve(new result_1.ChatKittyFailedResult(error));
                    },
                });
            }
            if (isSendChannelFileMessageRequest(request)) {
                var file = request.file;
                if (isCreateChatKittyExternalFileProperties(file)) {
                    _this.stompX.sendAction({
                        destination: destination,
                        body: {
                            type: 'FILE',
                            file: file,
                            groupTag: request.groupTag,
                            properties: request.properties,
                        },
                        onSuccess: function (message) {
                            resolve(new message_1.SentFileMessageResult(_this.messageMapper.map(message)));
                        },
                        onError: function (error) {
                            resolve(new result_1.ChatKittyFailedResult(error));
                        },
                    });
                }
                else {
                    var properties = new Map();
                    if (request.groupTag) {
                        properties.set('groupTag', request.groupTag);
                    }
                    if (request.properties) {
                        properties.set('properties', request.properties);
                    }
                    _this.stompX.sendToStream({
                        stream: stream,
                        grant: _this.writeFileGrant,
                        file: file,
                        properties: properties,
                        onSuccess: function (message) {
                            resolve(new message_1.SentFileMessageResult(_this.messageMapper.map(message)));
                        },
                        onError: function (error) {
                            resolve(new result_1.ChatKittyFailedResult(error));
                        },
                        progressListener: {
                            onStarted: function () { var _a, _b; return (_b = (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onStarted) === null || _b === void 0 ? void 0 : _b.call(_a); },
                            onProgress: function (progress) { var _a; return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onProgress(progress); },
                            onCompleted: function () {
                                var _a;
                                return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted(file_1.ChatKittyUploadResult.COMPLETED);
                            },
                            onFailed: function () {
                                var _a;
                                return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted(file_1.ChatKittyUploadResult.FAILED);
                            },
                            onCancelled: function () {
                                var _a;
                                return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted(file_1.ChatKittyUploadResult.CANCELLED);
                            },
                        },
                    });
                }
            }
        });
    };
    ChatKittyImpl.prototype.getMessages = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var relay = '';
        var parameters = undefined;
        if (isGetChannelMessagesRequest(request)) {
            relay = request.channel._relays.messages;
            parameters = __assign({}, request.filter);
        }
        if (isGetMessageRepliesRequest(request)) {
            relay = request.message._relays.replies;
        }
        return new Promise(function (resolve) {
            pagination_1.ChatKittyPaginator.createInstance({
                stompX: _this.stompX,
                relay: relay,
                parameters: parameters,
                contentName: 'messages',
                mapper: function (message) { return _this.messageMapper.map(message); },
            })
                .then(function (paginator) { return resolve(new message_1.GetMessagesSucceededResult(paginator)); })
                .catch(function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); });
        });
    };
    ChatKittyImpl.prototype.getUnreadMessagesCount = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var relay = currentUser._relays.unreadMessagesCount;
        if (isGetUnreadMessagesCountRequest(request)) {
            relay = request.channel._relays.messagesCount;
        }
        return new Promise(function (resolve) {
            _this.stompX.relayResource({
                destination: relay,
                parameters: {
                    unread: true,
                },
                onSuccess: function (resource) {
                    resolve(new result_1.GetCountSucceedResult(resource.count));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.triggerEvent = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.channel._actions.triggerEvent,
                body: {
                    type: request.type,
                    properties: request.properties
                },
                onSent: function () {
                    resolve(new event_1.TriggeredEventResult(request.channel));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.readMessage = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.message._actions.read,
                body: {},
                onSent: function () { return resolve(new message_1.ReadMessageSucceededResult(request.message)); },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.getLastReadMessage = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.relayResource({
                destination: request.channel._relays.lastReadMessage,
                parameters: {
                    username: request.username,
                },
                onSuccess: function (resource) {
                    resolve(new message_1.GetLastReadMessageResult(resource));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.editMessage = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.message._actions.edit,
                body: {
                    body: request.body,
                },
                onSuccess: function (message) {
                    return resolve(new message_1.EditedMessageSucceededResult(message));
                },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.getMessageRepliesCount = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.relayResource({
                destination: request.message._relays.repliesCount,
                onSuccess: function (resource) {
                    resolve(new result_1.GetCountSucceedResult(resource.count));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.getMessageChannel = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.relayResource({
                destination: request.message._relays.channel,
                onSuccess: function (resource) {
                    resolve(new message_1.GetMessageChannelSucceededResult(resource));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.getMessageParent = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            var destination = request.message._relays.parent;
            if (!destination) {
                throw new message_1.MessageNotAReplyError(request.message);
            }
            _this.stompX.relayResource({
                destination: destination,
                onSuccess: function (resource) {
                    resolve(new message_1.GetMessageParentSucceededResult(resource));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.createThread = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.channel._actions.createThread,
                body: { name: request.name, properties: request.properties },
                onSuccess: function (thread) { return resolve(new thread_1.CreatedThreadResult(thread)); },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.getThreads = function (request) {
        var _this = this;
        var _a, _b;
        var parameters = {};
        if (((_a = request.filter) === null || _a === void 0 ? void 0 : _a.includeMainThread) === false) {
            parameters.includeMainThread = false;
        }
        if (((_b = request.filter) === null || _b === void 0 ? void 0 : _b.standalone) === true) {
            parameters.standalone = true;
        }
        return new Promise(function (resolve) {
            pagination_1.ChatKittyPaginator.createInstance({
                stompX: _this.stompX,
                relay: request.channel._relays.threads,
                contentName: 'threads',
                parameters: parameters,
            })
                .then(function (paginator) {
                return resolve(new thread_1.GetThreadsSucceededResult(paginator));
            })
                .catch(function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); });
        });
    };
    ChatKittyImpl.prototype.getThreadChannel = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.relayResource({
                destination: request.thread._relays.channel,
                onSuccess: function (resource) {
                    resolve(new thread_1.GetThreadChannelSucceededResult(resource));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.getThreadMessage = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.relayResource({
                destination: request.thread._relays.message,
                onSuccess: function (resource) {
                    resolve(new thread_1.GetThreadMessageSucceededResult(resource));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.readThread = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.thread._actions.read,
                body: {},
                onSent: function () { return resolve(new thread_1.ReadThreadSucceededResult(request.thread)); },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.reactToMessage = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.message._actions.react,
                body: { emoji: request.emoji },
                onSuccess: function (reaction) { return resolve(new reaction_1.ReactedToMessageResult(reaction)); },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.getReactions = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            pagination_1.ChatKittyPaginator.createInstance({
                stompX: _this.stompX,
                relay: request.message._relays.reactions,
                contentName: 'reactions',
            })
                .then(function (paginator) {
                return resolve(new reaction_1.GetReactionsSucceededResult(paginator));
            })
                .catch(function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); });
        });
    };
    ChatKittyImpl.prototype.removeReaction = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.message._actions.removeReaction,
                body: {
                    emoji: request.emoji,
                },
                onSuccess: function (reaction) { return resolve(new reaction_1.RemovedReactionResult(reaction)); },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.deleteMessageForMe = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.message._actions.deleteForMe,
                body: {},
                onSuccess: function (resource) {
                    return resolve(new message_1.DeleteMessageForMeSucceededResult(resource));
                },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.deleteMessage = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.message._actions.delete,
                body: {},
                onSuccess: function (resource) {
                    return resolve(new message_1.DeleteMessageSucceededResult(resource));
                },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.sendKeystrokes = function (request) {
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        this.keyStrokesSubject.next(request);
    };
    ChatKittyImpl.prototype.onNotificationReceived = function (onNextOrObserver) {
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.notifications,
            event: 'user.notification.created',
            onSuccess: function (notification) {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(notification);
                }
                else {
                    onNextOrObserver.onNext(notification);
                }
            },
        });
        return function () { return unsubscribe; };
    };
    ChatKittyImpl.prototype.onChannelJoined = function (onNextOrObserver) {
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.channels,
            event: 'user.channel.joined',
            onSuccess: function (channel) {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(channel);
                }
                else {
                    onNextOrObserver.onNext(channel);
                }
            },
        });
        return function () { return unsubscribe; };
    };
    ChatKittyImpl.prototype.onChannelHidden = function (onNextOrObserver) {
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.channels,
            event: 'user.channel.hidden',
            onSuccess: function (channel) {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(channel);
                }
                else {
                    onNextOrObserver.onNext(channel);
                }
            },
        });
        return function () { return unsubscribe; };
    };
    ChatKittyImpl.prototype.onChannelUnhidden = function (onNextOrObserver) {
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.channels,
            event: 'user.channel.unhidden',
            onSuccess: function (channel) {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(channel);
                }
                else {
                    onNextOrObserver.onNext(channel);
                }
            },
        });
        return function () { return unsubscribe; };
    };
    ChatKittyImpl.prototype.onChannelLeft = function (onNextOrObserver) {
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.channels,
            event: 'user.channel.left',
            onSuccess: function (channel) {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(channel);
                }
                else {
                    onNextOrObserver.onNext(channel);
                }
            },
        });
        return function () { return unsubscribe; };
    };
    ChatKittyImpl.prototype.onChannelUpdated = function (onNextOrObserver) {
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.channels,
            event: 'user.channel.updated',
            onSuccess: function (channel) {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(channel);
                }
                else {
                    onNextOrObserver.onNext(channel);
                }
            },
        });
        return function () { return unsubscribe; };
    };
    ChatKittyImpl.prototype.getChannelMembers = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            pagination_1.ChatKittyPaginator.createInstance({
                stompX: _this.stompX,
                relay: request.channel._relays.members,
                contentName: 'users',
                parameters: __assign({}, request.filter),
            })
                .then(function (paginator) { return resolve(new user_1.GetUsersSucceededResult(paginator)); })
                .catch(function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); });
        });
    };
    ChatKittyImpl.prototype.getReadReceipts = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            pagination_1.ChatKittyPaginator.createInstance({
                stompX: _this.stompX,
                relay: request.message._relays.readReceipts,
                contentName: 'receipts',
            })
                .then(function (paginator) {
                return resolve(new read_receipt_1.GetReadReceiptsSucceededResult(paginator));
            })
                .catch(function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); });
        });
    };
    ChatKittyImpl.prototype.getUsers = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            var parameters = undefined;
            if (isGetUsersRequest(request)) {
                parameters = __assign({}, request.filter);
            }
            pagination_1.ChatKittyPaginator.createInstance({
                stompX: _this.stompX,
                relay: currentUser._relays.contacts,
                contentName: 'users',
                parameters: parameters,
            })
                .then(function (paginator) { return resolve(new user_1.GetUsersSucceededResult(paginator)); })
                .catch(function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); });
        });
    };
    ChatKittyImpl.prototype.getUsersCount = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            var parameters = undefined;
            if (isGetUsersRequest(request)) {
                parameters = __assign({}, request.filter);
            }
            _this.stompX.relayResource({
                destination: currentUser._relays.contactsCount,
                parameters: parameters,
                onSuccess: function (resource) {
                    resolve(new result_1.GetCountSucceedResult(resource.count));
                },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.onUserPresenceChanged = function (onNextOrObserver) {
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.contacts,
            event: 'contact.presence.changed',
            onSuccess: function (user) {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(user);
                }
                else {
                    onNextOrObserver.onNext(user);
                }
            },
        });
        return function () { return unsubscribe; };
    };
    ChatKittyImpl.prototype.inviteUser = function (request) {
        var _this = this;
        var destination = request.channel._actions.invite;
        if (!destination) {
            throw new channel_1.ChannelNotInvitableError(request.channel);
        }
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: destination,
                body: {
                    user: request.user,
                },
                onSuccess: function (resource) {
                    resolve(new channel_1.InvitedUserResult(resource));
                },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.onParticipantStartedTyping = function (onNextOrObserver) {
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.participants,
            event: 'participant.typing.started',
            onSuccess: function (participant) {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(participant);
                }
                else {
                    onNextOrObserver.onNext(participant);
                }
            },
        });
        return function () { return unsubscribe; };
    };
    ChatKittyImpl.prototype.onParticipantStoppedTyping = function (onNextOrObserver) {
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        var unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.participants,
            event: 'participant.typing.stopped',
            onSuccess: function (participant) {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(participant);
                }
                else {
                    onNextOrObserver.onNext(participant);
                }
            },
        });
        return function () { return unsubscribe; };
    };
    ChatKittyImpl.prototype.getUser = function (param) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.relayResource({
                destination: ChatKittyImpl.userRelay(param),
                onSuccess: function (user) {
                    resolve(new user_1.GetUserSucceededResult(user));
                },
            });
        });
    };
    ChatKittyImpl.prototype.getUserIsChannelMember = function (request) {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            _this.stompX.relayResource({
                destination: request.user._relays.channelMember,
                parameters: {
                    channelId: request.channel.id,
                },
                onSuccess: function (resource) {
                    resolve(new user_1.GetUserIsChannelMemberSucceededResult(resource.exists));
                },
                onError: function (error) {
                    resolve(new result_1.ChatKittyFailedResult(error));
                },
            });
        });
    };
    ChatKittyImpl.prototype.blockUser = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: "/application/v1/users/".concat(request.user.id, ".block"),
                body: {},
                onSuccess: function (resource) {
                    resolve(new user_1.BlockUserSucceededResult(resource));
                },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl.prototype.getUserBlockList = function () {
        var _this = this;
        var currentUser = this.currentUser;
        if (!currentUser) {
            throw new user_session_1.NoActiveSessionError();
        }
        return new Promise(function (resolve) {
            pagination_1.ChatKittyPaginator.createInstance({
                stompX: _this.stompX,
                relay: currentUser._relays.userBlockListItems,
                contentName: 'items',
            })
                .then(function (paginator) {
                return resolve(new user_block_list_item_1.GetUserBlockListSucceededResult(paginator));
            })
                .catch(function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); });
        });
    };
    ChatKittyImpl.prototype.deleteUserBlockListItem = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.stompX.sendAction({
                destination: request.item._actions.delete,
                body: {},
                onSuccess: function (resource) {
                    return resolve(new user_block_list_item_1.DeleteUserBlockListItemSucceededResult(resource));
                },
                onError: function (error) { return resolve(new result_1.ChatKittyFailedResult(error)); },
            });
        });
    };
    ChatKittyImpl._instances = new Map();
    return ChatKittyImpl;
}());
exports.ChatKittyImpl = ChatKittyImpl;
var MessageMapper = /** @class */ (function () {
    function MessageMapper(grant) {
        this.readFileGrant = grant;
    }
    MessageMapper.prototype.map = function (message) {
        if ((0, message_1.isFileMessage)(message)) {
            return __assign(__assign({}, message), { file: __assign(__assign({}, message.file), { url: message.file.url + "?grant=".concat(this.readFileGrant) }) });
        }
        else {
            return __assign({}, message);
        }
    };
    return MessageMapper;
}());
function isGetChannelsRequest(param) {
    var request = param;
    return (request === null || request === void 0 ? void 0 : request.filter) !== undefined;
}
function isGetUsersRequest(param) {
    var request = param;
    return (request === null || request === void 0 ? void 0 : request.filter) !== undefined;
}
function isGetChannelsUnreadRequest(param) {
    var request = param;
    return (request === null || request === void 0 ? void 0 : request.filter) !== undefined;
}
function isGetUnreadMessagesCountRequest(param) {
    var request = param;
    return (request === null || request === void 0 ? void 0 : request.channel) !== undefined;
}
function isSendChannelTextMessageRequest(request) {
    return request.body !== undefined;
}
function isSendChannelFileMessageRequest(request) {
    return request.file !== undefined;
}
function isGetChannelMessagesRequest(request) {
    return request.channel !== undefined;
}
function isGetMessageRepliesRequest(request) {
    return request.message !== undefined;
}
function isCreateChatKittyExternalFileProperties(result) {
    return (result.url !== undefined &&
        result.name !== undefined &&
        result.size !== undefined);
}
exports.default = ChatKittyImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdGtpdHR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9jaGF0a2l0dHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2QkFBOEM7QUFDOUMsNENBQTRDO0FBRTVDLDBEQUF1RDtBQUN2RCxxREFBK0I7QUFFL0IscUNBcURtQjtBQUNuQiwrQ0FLd0I7QUFDeEIsK0NBU3dCO0FBQ3hCLGlDQUtpQjtBQUNqQiwrQkFJZ0I7QUFPaEIscUNBMENtQjtBQUduQiwyQ0FBZ0Q7QUFDaEQsdUNBV29CO0FBQ3BCLCtDQUt3QjtBQUN4QixtQ0FJa0I7QUFDbEIsbUNBaUJrQjtBQUNsQiwrQkFhZ0I7QUFDaEIsK0RBT2dDO0FBQ2hDLCtDQU13QjtBQUV4QjtJQTJDRSx1QkFBb0MsYUFBcUM7UUFBekUsaUJBK0JDO1FBL0JtQyxrQkFBYSxHQUFiLGFBQWEsQ0FBd0I7UUFoQnhELHVCQUFrQixHQUFHLElBQUksc0JBQWUsQ0FDdkQsSUFBSSxDQUNMLENBQUM7UUFFZSwwQkFBcUIsR0FBRyxJQUFJLGNBQU8sRUFBUSxDQUFDO1FBQzVDLDZCQUF3QixHQUFHLElBQUksY0FBTyxFQUFRLENBQUM7UUFHeEQsaUJBQVksR0FBNkIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUVuRCxrQkFBYSxHQUFrQixJQUFJLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVyRCxzQkFBaUIsR0FBRyxJQUFJLGNBQU8sRUFBeUIsQ0FBQztRQUsvRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksZ0JBQU0sQ0FBQztZQUN2QixRQUFRLEVBQUUsYUFBYSxDQUFDLFFBQVEsS0FBSyxTQUFTLElBQUksYUFBYSxDQUFDLFFBQVE7WUFDeEUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxJQUFJLElBQUksbUJBQW1CO1lBQy9DLE9BQU8sRUFBRSxDQUFDLHlCQUFXLENBQUMsVUFBVTtTQUNqQyxDQUFDLENBQUM7UUFFSCxJQUFJLENB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