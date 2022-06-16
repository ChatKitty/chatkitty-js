import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { environment } from '../environment/environment';
import StompX from '../stompx';
import { AddedChannelModeratorResult, CannotAddModeratorToChannelError, ChannelNotInvitableError, ChannelNotPubliclyJoinableError, ClearChannelHistorySucceededResult, CreatedChannelResult, DeletedChannelResult, GetChannelsSucceededResult, GetChannelSucceededResult, GetChannelUnreadSucceededResult, HideChannelSucceededResult, InvitedUserResult, JoinedChannelResult, LeftChannelResult, MutedChannelResult, NotAChannelMemberError, ReadChannelSucceededResult, UnmutedChannelResult, UpdatedChannelResult, } from './channel';
import { StartedChatSessionResult, } from './chat-session';
import { GetCurrentUserSuccessfulResult, UpdatedCurrentUserDisplayPictureResult, UpdatedCurrentUserResult, } from './current-user';
import { TriggeredEventResult } from "./event";
import { ChatKittyUploadResult, } from './file';
import { DeleteMessageForMeSucceededResult, DeleteMessageSucceededResult, EditedMessageSucceededResult, GetLastReadMessageSucceededResult, GetMessageChannelSucceededResult, GetMessageParentSucceededResult, GetMessagesSucceededResult, isFileMessage, MessageNotAReplyError, ReadMessageSucceededResult, SentFileMessageResult, SentTextMessageResult } from './message';
import { ChatKittyPaginator } from './pagination';
import { GetReactionsSucceededResult, ReactedToMessageResult, RemovedReactionResult, } from './reaction';
import { GetReadReceiptsSucceededResult, } from './read-receipt';
import { ChatKittyFailedResult, GetCountSucceedResult, } from './result';
import { CreatedThreadResult, GetThreadChannelSucceededResult, GetThreadMessageSucceededResult, GetThreadsSucceededResult, ReadThreadSucceededResult } from './thread';
import { BlockUserSucceededResult, GetUserIsChannelMemberSucceededResult, GetUsersSucceededResult, GetUserSucceededResult, } from './user';
import { DeleteUserBlockListItemSucceededResult, GetUserBlockListSucceededResult, } from './user-block-list-item';
import { NoActiveSessionError, SessionActiveError, StartedSessionResult, } from './user-session';
export class ChatKittyImpl {
    constructor(configuration) {
        this.configuration = configuration;
        this.currentUserSubject = new BehaviorSubject(null);
        this.lostConnectionSubject = new Subject();
        this.resumedConnectionSubject = new Subject();
        this.chatSessions = new Map();
        this.messageMapper = new MessageMapper('');
        this.keyStrokesSubject = new Subject();
        this.stompX = new StompX({
            isSecure: configuration.isSecure === undefined || configuration.isSecure,
            host: configuration.host || 'api.chatkitty.com',
            isDebug: !environment.production,
        });
        this.keyStrokesSubject
            .asObservable()
            .pipe(debounceTime(150))
            .subscribe((request) => {
            let destination = '';
            const channel = request.channel;
            const thread = request.thread;
            if (channel) {
                destination = channel._actions.keystrokes;
            }
            if (thread) {
                destination = thread._actions.keystrokes;
            }
            this.stompX.sendAction({
                destination,
                body: {
                    keys: request.keys,
                },
            });
        });
    }
    static getInstance(apiKey) {
        let instance = ChatKittyImpl._instances.get(apiKey);
        if (instance !== undefined) {
            return instance;
        }
        instance = new ChatKittyImpl({ apiKey: apiKey });
        ChatKittyImpl._instances.set(apiKey, instance);
        return instance;
    }
    static channelRelay(id) {
        return '/application/v1/channels/' + id + '.relay';
    }
    static userRelay(id) {
        return '/application/v1/users/' + id + '.relay';
    }
    startSession(request) {
        if (this.stompX.initialized) {
            throw new SessionActiveError();
        }
        return new Promise((resolve) => {
            this.stompX.connect({
                apiKey: this.configuration.apiKey,
                username: request.username,
                authParams: request.authParams,
                onSuccess: (user, writeFileGrant, readFileGrant) => {
                    this.stompX.listenToTopic({ topic: user._topics.self });
                    this.stompX.listenToTopic({ topic: user._topics.channels });
                    this.stompX.listenToTopic({ topic: user._topics.messages });
                    this.stompX.listenToTopic({ topic: user._topics.notifications });
                    this.stompX.listenToTopic({ topic: user._topics.contacts });
                    this.stompX.listenToTopic({ topic: user._topics.participants });
                    this.stompX.listenToTopic({ topic: user._topics.users });
                    this.stompX.listenToTopic({ topic: user._topics.reactions });
                    this.stompX.listenToTopic({ topic: user._topics.threads });
                    this.stompX.listenToTopic({ topic: user._topics.calls });
                    this.writeFileGrant = writeFileGrant;
                    this.messageMapper = new MessageMapper(readFileGrant);
                    resolve(new StartedSessionResult({ user: user }));
                },
                onConnected: (user) => {
                    this.currentUser = user;
                    this.currentUserSubject.next(user);
                },
                onConnectionLost: () => this.lostConnectionSubject.next(),
                onConnectionResumed: () => this.resumedConnectionSubject.next(),
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    endSession() {
        return new Promise((resolve, reject) => {
            this.stompX.disconnect({
                onSuccess: () => {
                    this.currentUser = undefined;
                    this.currentUserSubject.next(null);
                    resolve();
                },
                onError: (e) => {
                    reject(e);
                },
            });
        });
    }
    getCurrentUser() {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            this.stompX.relayResource({
                destination: currentUser._relays.self,
                onSuccess: (user) => {
                    resolve(new GetCurrentUserSuccessfulResult(user));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    onCurrentUserChanged(onNextOrObserver) {
        const subscription = this.currentUserSubject.subscribe((user) => {
            if (typeof onNextOrObserver === 'function') {
                onNextOrObserver(user);
            }
            else {
                onNextOrObserver.onNext(user);
            }
        });
        return () => subscription.unsubscribe();
    }
    onCurrentUserOnline(onNextOrObserver) {
        const subscription = this.resumedConnectionSubject.subscribe(() => {
            if (typeof onNextOrObserver === 'function') {
                onNextOrObserver();
            }
            else {
                if (this.currentUser) {
                    onNextOrObserver.onNext(this.currentUser);
                }
            }
        });
        return () => subscription.unsubscribe();
    }
    onCurrentUserOffline(onNextOrObserver) {
        const subscription = this.lostConnectionSubject.subscribe(() => {
            if (typeof onNextOrObserver === 'function') {
                onNextOrObserver();
            }
            else {
                if (this.currentUser) {
                    onNextOrObserver.onNext(this.currentUser);
                }
            }
        });
        return () => subscription.unsubscribe();
    }
    updateCurrentUser(update) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: currentUser._actions.update,
                body: update(currentUser),
                onSuccess: (user) => {
                    this.currentUserSubject.next(user);
                    resolve(new UpdatedCurrentUserResult(user));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    updateCurrentUserDisplayPicture(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            const file = request.file;
            if (file.uri) {
                this.stompX.sendToStream({
                    stream: currentUser._streams.displayPicture,
                    grant: this.writeFileGrant,
                    file: file,
                    onSuccess: (user) => {
                        resolve(new UpdatedCurrentUserDisplayPictureResult(user));
                    },
                    onError: (error) => {
                        resolve(new ChatKittyFailedResult(error));
                    },
                    progressListener: {
                        onStarted: () => { var _a, _b; return (_b = (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onStarted) === null || _b === void 0 ? void 0 : _b.call(_a); },
                        onProgress: (progress) => { var _a; return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onProgress(progress); },
                        onCompleted: () => {
                            var _a;
                            return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted(ChatKittyUploadResult.COMPLETED);
                        },
                        onFailed: () => {
                            var _a;
                            return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted(ChatKittyUploadResult.FAILED);
                        },
                        onCancelled: () => {
                            var _a;
                            return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted(ChatKittyUploadResult.CANCELLED);
                        },
                    },
                });
            }
            else {
                this.stompX.sendAction({
                    destination: currentUser._actions.updateDisplayPicture,
                    body: file,
                    onSuccess: (user) => {
                        resolve(new UpdatedCurrentUserResult(user));
                    },
                    onError: (error) => {
                        resolve(new ChatKittyFailedResult(error));
                    },
                });
            }
        });
    }
    updateChannel(request) {
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.channel._actions.update,
                body: request.channel,
                onSuccess: (channel) => {
                    resolve(new UpdatedChannelResult(channel));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    deleteChannel(request) {
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.channel._actions.delete,
                body: {},
                onSuccess: () => {
                    resolve(new DeletedChannelResult());
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    createChannel(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: currentUser._actions.createChannel,
                events: ['user.channel.created', 'user.channel.upserted', 'member.channel.upserted'],
                body: request,
                onSuccess: (channel) => {
                    resolve(new CreatedChannelResult(channel));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    getChannels(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            var _a, _b, _c, _d;
            const parameters = {};
            let relay = currentUser._relays.channels;
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
            const name = (_d = request === null || request === void 0 ? void 0 : request.filter) === null || _d === void 0 ? void 0 : _d.name;
            if (name) {
                parameters.name = name;
            }
            ChatKittyPaginator.createInstance({
                stompX: this.stompX,
                relay: relay,
                contentName: 'channels',
                parameters: parameters,
            })
                .then((paginator) => resolve(new GetChannelsSucceededResult(paginator)))
                .catch((error) => resolve(new ChatKittyFailedResult(error)));
        });
    }
    getChannel(id) {
        return new Promise((resolve) => {
            this.stompX.relayResource({
                destination: ChatKittyImpl.channelRelay(id),
                onSuccess: (channel) => {
                    resolve(new GetChannelSucceededResult(channel));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    joinChannel(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        const destination = request.channel._actions.join;
        if (!destination) {
            throw new ChannelNotPubliclyJoinableError(request.channel);
        }
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: destination,
                body: request,
                onSuccess: (channel) => {
                    resolve(new JoinedChannelResult(channel));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    leaveChannel(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        const destination = request.channel._actions.leave;
        if (!destination) {
            throw new NotAChannelMemberError(request.channel);
        }
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: destination,
                body: {},
                onSuccess: (channel) => {
                    resolve(new LeftChannelResult(channel));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    addChannelModerator(request) {
        const destination = request.channel._actions.addModerator;
        if (!destination) {
            throw new CannotAddModeratorToChannelError(request.channel);
        }
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: destination,
                body: request.user,
                onSuccess: (channel) => {
                    resolve(new AddedChannelModeratorResult(channel));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    getUnreadChannelsCount(request) {
        var _a;
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        const parameters = {
            unread: true,
        };
        if (isGetChannelsUnreadRequest(request)) {
            parameters.type = (_a = request.filter) === null || _a === void 0 ? void 0 : _a.type;
        }
        return new Promise((resolve) => {
            this.stompX.relayResource({
                destination: currentUser._relays.channelsCount,
                parameters: parameters,
                onSuccess: (resource) => {
                    resolve(new GetCountSucceedResult(resource.count));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    getChannelUnread(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            this.stompX.relayResource({
                destination: request.channel._relays.unread,
                onSuccess: (resource) => {
                    resolve(new GetChannelUnreadSucceededResult(resource.exists));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    readChannel(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.channel._actions.read,
                body: {},
                onSent: () => resolve(new ReadChannelSucceededResult(request.channel)),
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    muteChannel(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.channel._actions.mute,
                body: {
                    state: 'ON',
                },
                onSuccess: (channel) => {
                    resolve(new MutedChannelResult(channel));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    unmuteChannel(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.channel._actions.mute,
                body: {
                    state: 'OFF',
                },
                onSuccess: (channel) => {
                    resolve(new UnmutedChannelResult(channel));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    clearChannelHistory(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.channel._actions.clearHistory,
                body: {},
                onSuccess: (channel) => resolve(new ClearChannelHistorySucceededResult(channel)),
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    hideChannel(request) {
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.channel._actions.hide,
                body: {},
                onSuccess: (resource) => resolve(new HideChannelSucceededResult(resource)),
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    startChatSession(request) {
        const onReceivedMessage = request.onReceivedMessage;
        const onReceivedKeystrokes = request.onReceivedKeystrokes;
        const onParticipantEnteredChat = request.onParticipantEnteredChat;
        const onParticipantLeftChat = request.onParticipantLeftChat;
        const onTypingStarted = request.onTypingStarted;
        const onTypingStopped = request.onTypingStopped;
        const onParticipantPresenceChanged = request.onParticipantPresenceChanged;
        const onEventTriggered = request.onEventTriggered;
        const onMessageUpdated = request.onMessageUpdated;
        const onChannelUpdated = request.onChannelUpdated;
        const onMessageRead = request.onMessageRead;
        const onMessageReactionAdded = request.onMessageReactionAdded;
        const onMessageReactionRemoved = request.onMessageReactionRemoved;
        const onThreadReceivedMessage = request.onThreadReceivedMessage;
        const onThreadReceivedKeystrokes = request.onThreadReceivedKeystrokes;
        const onThreadTypingStarted = request.onThreadTypingStarted;
        const onThreadTypingStopped = request.onThreadTypingStopped;
        let receivedMessageUnsubscribe;
        let receivedKeystrokesUnsubscribe;
        let participantEnteredChatUnsubscribe;
        let participantLeftChatUnsubscribe;
        let typingStartedUnsubscribe;
        let typingStoppedUnsubscribe;
        let participantPresenceChangedUnsubscribe;
        let eventTriggeredUnsubscribe;
        let messageUpdatedUnsubscribe;
        let channelUpdatedUnsubscribe;
        let messageReadUnsubscribe;
        let messageReactionAddedUnsubscribe;
        let messageReactionRemovedUnsubscribe;
        let threadReceivedMessageUnsubscribe;
        let threadReceivedKeystrokesUnsubscribe;
        let threadTypingStartedUnsubscribe;
        let threadTypingStoppedUnsubscribe;
        if (onReceivedMessage) {
            receivedMessageUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.messages,
                event: 'channel.message.created',
                onSuccess: (message) => {
                    const destination = message._relays.parent;
                    if (destination) {
                        this.stompX.relayResource({
                            destination,
                            onSuccess: (parent) => {
                                onReceivedMessage(this.messageMapper.map(message), this.messageMapper.map(parent));
                            },
                        });
                    }
                    else {
                        onReceivedMessage(this.messageMapper.map(message));
                    }
                },
            });
        }
        if (onReceivedKeystrokes) {
            receivedKeystrokesUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.keystrokes,
                event: 'thread.keystrokes.created',
                onSuccess: (keystrokes) => {
                    onReceivedKeystrokes(keystrokes);
                },
            });
        }
        if (onTypingStarted) {
            typingStartedUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.typing,
                event: 'thread.typing.started',
                onSuccess: (user) => {
                    onTypingStarted(user);
                },
            });
        }
        if (onTypingStopped) {
            typingStoppedUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.typing,
                event: 'thread.typing.stopped',
                onSuccess: (user) => {
                    onTypingStopped(user);
                },
            });
        }
        if (onParticipantEnteredChat) {
            participantEnteredChatUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.participants,
                event: 'channel.participant.active',
                onSuccess: (user) => {
                    onParticipantEnteredChat(user);
                },
            });
        }
        if (onParticipantLeftChat) {
            participantLeftChatUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.participants,
                event: 'channel.participant.inactive',
                onSuccess: (user) => {
                    onParticipantLeftChat(user);
                },
            });
        }
        if (onParticipantPresenceChanged) {
            participantPresenceChangedUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.participants,
                event: 'participant.presence.changed',
                onSuccess: (user) => {
                    onParticipantPresenceChanged(user);
                },
            });
        }
        if (onMessageUpdated) {
            messageUpdatedUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.messages,
                event: 'channel.message.updated',
                onSuccess: (message) => {
                    onMessageUpdated(message);
                },
            });
        }
        if (onEventTriggered) {
            eventTriggeredUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.events,
                event: 'channel.event.triggered',
                onSuccess: (event) => {
                    onEventTriggered(event);
                },
            });
        }
        if (onChannelUpdated) {
            channelUpdatedUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.self,
                event: 'channel.self.updated',
                onSuccess: (channel) => {
                    onChannelUpdated(channel);
                },
            });
        }
        if (onMessageRead) {
            messageReadUnsubscribe = this.stompX.listenForEvent({
                topic: request.channel._topics.readReceipts,
                event: 'message.read_receipt.created',
                onSuccess: (receipt) => {
                    this.stompX.relayResource({
                        destination: receipt._relays.message,
                        onSuccess: (message) => {
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
                onSuccess: (reaction) => {
                    this.stompX.relayResource({
                        destination: reaction._relays.message,
                        onSuccess: (message) => {
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
                onSuccess: (reaction) => {
                    this.stompX.relayResource({
                        destination: reaction._relays.message,
                        onSuccess: (message) => {
                            onMessageReactionRemoved(message, reaction);
                        },
                    });
                },
            });
        }
        let end = () => {
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
        const channelUnsubscribe = this.stompX.listenToTopic({
            topic: request.channel._topics.self,
            onSuccess: () => {
                const messagesUnsubscribe = this.stompX.listenToTopic({
                    topic: request.channel._topics.messages,
                });
                const keystrokesUnsubscribe = this.stompX.listenToTopic({
                    topic: request.channel._topics.keystrokes,
                });
                const typingUnsubscribe = this.stompX.listenToTopic({
                    topic: request.channel._topics.typing,
                });
                const participantsUnsubscribe = this.stompX.listenToTopic({
                    topic: request.channel._topics.participants,
                });
                const readReceiptsUnsubscribe = this.stompX.listenToTopic({
                    topic: request.channel._topics.readReceipts,
                });
                const reactionsUnsubscribe = this.stompX.listenToTopic({
                    topic: request.channel._topics.reactions,
                });
                const eventsUnsubscribe = this.stompX.listenToTopic({
                    topic: request.channel._topics.events,
                });
                const superEnd = end;
                end = () => {
                    superEnd();
                    eventsUnsubscribe === null || eventsUnsubscribe === void 0 ? void 0 : eventsUnsubscribe();
                    reactionsUnsubscribe === null || reactionsUnsubscribe === void 0 ? void 0 : reactionsUnsubscribe();
                    readReceiptsUnsubscribe === null || readReceiptsUnsubscribe === void 0 ? void 0 : readReceiptsUnsubscribe();
                    participantsUnsubscribe === null || participantsUnsubscribe === void 0 ? void 0 : participantsUnsubscribe();
                    typingUnsubscribe === null || typingUnsubscribe === void 0 ? void 0 : typingUnsubscribe();
                    keystrokesUnsubscribe === null || keystrokesUnsubscribe === void 0 ? void 0 : keystrokesUnsubscribe();
                    messagesUnsubscribe === null || messagesUnsubscribe === void 0 ? void 0 : messagesUnsubscribe();
                    channelUnsubscribe();
                    this.chatSessions.delete(request.channel.id);
                };
            },
        });
        let activeThread = null;
        const session = {
            channel: request.channel,
            thread: activeThread,
            end: () => end(),
            setThread: (thread) => {
                threadReceivedMessageUnsubscribe === null || threadReceivedMessageUnsubscribe === void 0 ? void 0 : threadReceivedMessageUnsubscribe();
                threadReceivedKeystrokesUnsubscribe === null || threadReceivedKeystrokesUnsubscribe === void 0 ? void 0 : threadReceivedKeystrokesUnsubscribe();
                threadTypingStartedUnsubscribe === null || threadTypingStartedUnsubscribe === void 0 ? void 0 : threadTypingStartedUnsubscribe();
                threadTypingStoppedUnsubscribe === null || threadTypingStoppedUnsubscribe === void 0 ? void 0 : threadTypingStoppedUnsubscribe();
                if (onThreadReceivedMessage) {
                    threadReceivedMessageUnsubscribe = this.stompX.listenForEvent({
                        topic: thread._topics.messages,
                        event: 'thread.message.created',
                        onSuccess: (message) => {
                            onThreadReceivedMessage(thread, this.messageMapper.map(message));
                        },
                    });
                }
                if (onThreadReceivedKeystrokes) {
                    threadReceivedKeystrokesUnsubscribe = this.stompX.listenForEvent({
                        topic: thread._topics.keystrokes,
                        event: 'thread.keystrokes.created',
                        onSuccess: (keystrokes) => {
                            onThreadReceivedKeystrokes(thread, keystrokes);
                        },
                    });
                }
                if (onThreadTypingStarted) {
                    threadTypingStartedUnsubscribe = this.stompX.listenForEvent({
                        topic: thread._topics.typing,
                        event: 'thread.typing.started',
                        onSuccess: (user) => {
                            onThreadTypingStarted(thread, user);
                        },
                    });
                }
                if (onThreadTypingStopped) {
                    threadTypingStoppedUnsubscribe = this.stompX.listenForEvent({
                        topic: thread._topics.typing,
                        event: 'thread.typing.stopped',
                        onSuccess: (user) => {
                            onThreadTypingStopped(thread, user);
                        },
                    });
                }
                activeThread = thread;
            },
        };
        this.chatSessions.set(request.channel.id, session);
        return new StartedChatSessionResult(session);
    }
    sendMessage(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            let destination = '';
            let stream = '';
            const sendChannelMessageRequest = request;
            if (sendChannelMessageRequest.channel !== undefined) {
                destination = sendChannelMessageRequest.channel._actions.message;
                stream = sendChannelMessageRequest.channel._streams.messages;
            }
            const sendMessageReplyRequest = request;
            if (sendMessageReplyRequest.message !== undefined) {
                destination = sendMessageReplyRequest.message._actions.reply;
                stream = sendMessageReplyRequest.message._streams.replies;
            }
            const sendThreadMessageRequest = request;
            if (sendThreadMessageRequest.thread !== undefined) {
                destination = sendThreadMessageRequest.thread._actions.message;
                stream = sendThreadMessageRequest.thread._streams.messages;
            }
            if (isSendChannelTextMessageRequest(request)) {
                this.stompX.sendAction({
                    destination: destination,
                    body: {
                        type: 'TEXT',
                        body: request.body,
                        groupTag: request.groupTag,
                        properties: request.properties,
                    },
                    onSuccess: (message) => {
                        resolve(new SentTextMessageResult(this.messageMapper.map(message)));
                    },
                    onError: (error) => {
                        resolve(new ChatKittyFailedResult(error));
                    },
                });
            }
            if (isSendChannelFileMessageRequest(request)) {
                const file = request.file;
                if (isCreateChatKittyExternalFileProperties(file)) {
                    this.stompX.sendAction({
                        destination: destination,
                        body: {
                            type: 'FILE',
                            file: file,
                            groupTag: request.groupTag,
                            properties: request.properties,
                        },
                        onSuccess: (message) => {
                            resolve(new SentFileMessageResult(this.messageMapper.map(message)));
                        },
                        onError: (error) => {
                            resolve(new ChatKittyFailedResult(error));
                        },
                    });
                }
                else {
                    const properties = new Map();
                    if (request.groupTag) {
                        properties.set('groupTag', request.groupTag);
                    }
                    if (request.properties) {
                        properties.set('properties', request.properties);
                    }
                    this.stompX.sendToStream({
                        stream: stream,
                        grant: this.writeFileGrant,
                        file: file,
                        properties: properties,
                        onSuccess: (message) => {
                            resolve(new SentFileMessageResult(this.messageMapper.map(message)));
                        },
                        onError: (error) => {
                            resolve(new ChatKittyFailedResult(error));
                        },
                        progressListener: {
                            onStarted: () => { var _a, _b; return (_b = (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onStarted) === null || _b === void 0 ? void 0 : _b.call(_a); },
                            onProgress: (progress) => { var _a; return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onProgress(progress); },
                            onCompleted: () => {
                                var _a;
                                return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted(ChatKittyUploadResult.COMPLETED);
                            },
                            onFailed: () => {
                                var _a;
                                return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted(ChatKittyUploadResult.FAILED);
                            },
                            onCancelled: () => {
                                var _a;
                                return (_a = request.progressListener) === null || _a === void 0 ? void 0 : _a.onCompleted(ChatKittyUploadResult.CANCELLED);
                            },
                        },
                    });
                }
            }
        });
    }
    getMessages(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        let relay = '';
        let parameters = undefined;
        if (isGetChannelMessagesRequest(request)) {
            relay = request.channel._relays.messages;
            parameters = Object.assign({}, request.filter);
        }
        if (isGetMessageRepliesRequest(request)) {
            relay = request.message._relays.replies;
        }
        return new Promise((resolve) => {
            ChatKittyPaginator.createInstance({
                stompX: this.stompX,
                relay: relay,
                parameters: parameters,
                contentName: 'messages',
                mapper: (message) => this.messageMapper.map(message),
            })
                .then((paginator) => resolve(new GetMessagesSucceededResult(paginator)))
                .catch((error) => resolve(new ChatKittyFailedResult(error)));
        });
    }
    getUnreadMessagesCount(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        let relay = currentUser._relays.unreadMessagesCount;
        if (isGetUnreadMessagesCountRequest(request)) {
            relay = request.channel._relays.messagesCount;
        }
        return new Promise((resolve) => {
            this.stompX.relayResource({
                destination: relay,
                parameters: {
                    unread: true,
                },
                onSuccess: (resource) => {
                    resolve(new GetCountSucceedResult(resource.count));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    triggerEvent(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.channel._actions.triggerEvent,
                body: {
                    type: request.type,
                    properties: request.properties
                },
                onSent: () => {
                    resolve(new TriggeredEventResult(request.channel));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    readMessage(request) {
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.message._actions.read,
                body: {},
                onSent: () => resolve(new ReadMessageSucceededResult(request.message)),
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    getLastReadMessage(request) {
        return new Promise((resolve) => {
            this.stompX.relayResource({
                destination: request.channel._relays.lastReadMessage,
                parameters: {
                    username: request.username,
                },
                onSuccess: (resource) => {
                    resolve(new GetLastReadMessageSucceededResult(resource));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    editMessage(request) {
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.message._actions.edit,
                body: {
                    body: request.body,
                },
                onSuccess: (message) => resolve(new EditedMessageSucceededResult(message)),
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    getMessageRepliesCount(request) {
        return new Promise((resolve) => {
            this.stompX.relayResource({
                destination: request.message._relays.repliesCount,
                onSuccess: (resource) => {
                    resolve(new GetCountSucceedResult(resource.count));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    getMessageChannel(request) {
        return new Promise((resolve) => {
            this.stompX.relayResource({
                destination: request.message._relays.channel,
                onSuccess: (resource) => {
                    resolve(new GetMessageChannelSucceededResult(resource));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    getMessageParent(request) {
        return new Promise((resolve) => {
            const destination = request.message._relays.parent;
            if (!destination) {
                throw new MessageNotAReplyError(request.message);
            }
            this.stompX.relayResource({
                destination,
                onSuccess: (resource) => {
                    resolve(new GetMessageParentSucceededResult(resource));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    createThread(request) {
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.channel._actions.createThread,
                body: { name: request.name, properties: request.properties },
                onSuccess: (thread) => resolve(new CreatedThreadResult(thread)),
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    getThreads(request) {
        var _a, _b;
        const parameters = {};
        if (((_a = request.filter) === null || _a === void 0 ? void 0 : _a.includeMainThread) === false) {
            parameters.includeMainThread = false;
        }
        if (((_b = request.filter) === null || _b === void 0 ? void 0 : _b.standalone) === true) {
            parameters.standalone = true;
        }
        return new Promise((resolve) => {
            ChatKittyPaginator.createInstance({
                stompX: this.stompX,
                relay: request.channel._relays.threads,
                contentName: 'threads',
                parameters,
            })
                .then((paginator) => resolve(new GetThreadsSucceededResult(paginator)))
                .catch((error) => resolve(new ChatKittyFailedResult(error)));
        });
    }
    getThreadChannel(request) {
        return new Promise((resolve) => {
            this.stompX.relayResource({
                destination: request.thread._relays.channel,
                onSuccess: (resource) => {
                    resolve(new GetThreadChannelSucceededResult(resource));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    getThreadMessage(request) {
        return new Promise((resolve) => {
            this.stompX.relayResource({
                destination: request.thread._relays.message,
                onSuccess: (resource) => {
                    resolve(new GetThreadMessageSucceededResult(resource));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    readThread(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.thread._actions.read,
                body: {},
                onSent: () => resolve(new ReadThreadSucceededResult(request.thread)),
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    reactToMessage(request) {
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.message._actions.react,
                body: { emoji: request.emoji },
                onSuccess: (reaction) => resolve(new ReactedToMessageResult(reaction)),
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    getReactions(request) {
        return new Promise((resolve) => {
            ChatKittyPaginator.createInstance({
                stompX: this.stompX,
                relay: request.message._relays.reactions,
                contentName: 'reactions',
            })
                .then((paginator) => resolve(new GetReactionsSucceededResult(paginator)))
                .catch((error) => resolve(new ChatKittyFailedResult(error)));
        });
    }
    removeReaction(request) {
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.message._actions.removeReaction,
                body: {
                    emoji: request.emoji,
                },
                onSuccess: (reaction) => resolve(new RemovedReactionResult(reaction)),
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    deleteMessageForMe(request) {
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.message._actions.deleteForMe,
                body: {},
                onSuccess: (resource) => resolve(new DeleteMessageForMeSucceededResult(resource)),
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    deleteMessage(request) {
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.message._actions.delete,
                body: {},
                onSuccess: (resource) => resolve(new DeleteMessageSucceededResult(resource)),
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    sendKeystrokes(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        this.keyStrokesSubject.next(request);
    }
    onNotificationReceived(onNextOrObserver) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        const unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.notifications,
            event: 'user.notification.created',
            onSuccess: (notification) => {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(notification);
                }
                else {
                    onNextOrObserver.onNext(notification);
                }
            },
        });
        return () => unsubscribe;
    }
    onChannelJoined(onNextOrObserver) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        const unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.channels,
            event: 'user.channel.joined',
            onSuccess: (channel) => {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(channel);
                }
                else {
                    onNextOrObserver.onNext(channel);
                }
            },
        });
        return () => unsubscribe;
    }
    onChannelHidden(onNextOrObserver) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        const unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.channels,
            event: 'user.channel.hidden',
            onSuccess: (channel) => {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(channel);
                }
                else {
                    onNextOrObserver.onNext(channel);
                }
            },
        });
        return () => unsubscribe;
    }
    onChannelUnhidden(onNextOrObserver) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        const unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.channels,
            event: 'user.channel.unhidden',
            onSuccess: (channel) => {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(channel);
                }
                else {
                    onNextOrObserver.onNext(channel);
                }
            },
        });
        return () => unsubscribe;
    }
    onChannelLeft(onNextOrObserver) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        const unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.channels,
            event: 'user.channel.left',
            onSuccess: (channel) => {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(channel);
                }
                else {
                    onNextOrObserver.onNext(channel);
                }
            },
        });
        return () => unsubscribe;
    }
    onChannelUpdated(onNextOrObserver) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        const unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.channels,
            event: 'user.channel.updated',
            onSuccess: (channel) => {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(channel);
                }
                else {
                    onNextOrObserver.onNext(channel);
                }
            },
        });
        return () => unsubscribe;
    }
    getChannelMembers(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            ChatKittyPaginator.createInstance({
                stompX: this.stompX,
                relay: request.channel._relays.members,
                contentName: 'users',
                parameters: Object.assign({}, request.filter),
            })
                .then((paginator) => resolve(new GetUsersSucceededResult(paginator)))
                .catch((error) => resolve(new ChatKittyFailedResult(error)));
        });
    }
    getReadReceipts(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            ChatKittyPaginator.createInstance({
                stompX: this.stompX,
                relay: request.message._relays.readReceipts,
                contentName: 'receipts',
            })
                .then((paginator) => resolve(new GetReadReceiptsSucceededResult(paginator)))
                .catch((error) => resolve(new ChatKittyFailedResult(error)));
        });
    }
    getUsers(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            let parameters = undefined;
            if (isGetUsersRequest(request)) {
                parameters = Object.assign({}, request.filter);
            }
            ChatKittyPaginator.createInstance({
                stompX: this.stompX,
                relay: currentUser._relays.contacts,
                contentName: 'users',
                parameters: parameters,
            })
                .then((paginator) => resolve(new GetUsersSucceededResult(paginator)))
                .catch((error) => resolve(new ChatKittyFailedResult(error)));
        });
    }
    getUsersCount(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            let parameters = undefined;
            if (isGetUsersRequest(request)) {
                parameters = Object.assign({}, request.filter);
            }
            this.stompX.relayResource({
                destination: currentUser._relays.contactsCount,
                parameters: parameters,
                onSuccess: (resource) => {
                    resolve(new GetCountSucceedResult(resource.count));
                },
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    onUserPresenceChanged(onNextOrObserver) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        const unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.contacts,
            event: 'contact.presence.changed',
            onSuccess: (user) => {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(user);
                }
                else {
                    onNextOrObserver.onNext(user);
                }
            },
        });
        return () => unsubscribe;
    }
    inviteUser(request) {
        const destination = request.channel._actions.invite;
        if (!destination) {
            throw new ChannelNotInvitableError(request.channel);
        }
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: destination,
                body: {
                    user: request.user,
                },
                onSuccess: (resource) => {
                    resolve(new InvitedUserResult(resource));
                },
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    onParticipantStartedTyping(onNextOrObserver) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        const unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.participants,
            event: 'participant.typing.started',
            onSuccess: (participant) => {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(participant);
                }
                else {
                    onNextOrObserver.onNext(participant);
                }
            },
        });
        return () => unsubscribe;
    }
    onParticipantStoppedTyping(onNextOrObserver) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        const unsubscribe = this.stompX.listenForEvent({
            topic: currentUser._topics.participants,
            event: 'participant.typing.stopped',
            onSuccess: (participant) => {
                if (typeof onNextOrObserver === 'function') {
                    onNextOrObserver(participant);
                }
                else {
                    onNextOrObserver.onNext(participant);
                }
            },
        });
        return () => unsubscribe;
    }
    getUser(param) {
        return new Promise((resolve) => {
            this.stompX.relayResource({
                destination: ChatKittyImpl.userRelay(param),
                onSuccess: (user) => {
                    resolve(new GetUserSucceededResult(user));
                },
            });
        });
    }
    getUserIsChannelMember(request) {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            this.stompX.relayResource({
                destination: request.user._relays.channelMember,
                parameters: {
                    channelId: request.channel.id,
                },
                onSuccess: (resource) => {
                    resolve(new GetUserIsChannelMemberSucceededResult(resource.exists));
                },
                onError: (error) => {
                    resolve(new ChatKittyFailedResult(error));
                },
            });
        });
    }
    blockUser(request) {
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: `/application/v1/users/${request.user.id}.block`,
                body: {},
                onSuccess: (resource) => {
                    resolve(new BlockUserSucceededResult(resource));
                },
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
    getUserBlockList() {
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new NoActiveSessionError();
        }
        return new Promise((resolve) => {
            ChatKittyPaginator.createInstance({
                stompX: this.stompX,
                relay: currentUser._relays.userBlockListItems,
                contentName: 'items',
            })
                .then((paginator) => resolve(new GetUserBlockListSucceededResult(paginator)))
                .catch((error) => resolve(new ChatKittyFailedResult(error)));
        });
    }
    deleteUserBlockListItem(request) {
        return new Promise((resolve) => {
            this.stompX.sendAction({
                destination: request.item._actions.delete,
                body: {},
                onSuccess: (resource) => resolve(new DeleteUserBlockListItemSucceededResult(resource)),
                onError: (error) => resolve(new ChatKittyFailedResult(error)),
            });
        });
    }
}
ChatKittyImpl._instances = new Map();
class MessageMapper {
    constructor(grant) {
        this.readFileGrant = grant;
    }
    map(message) {
        if (isFileMessage(message)) {
            return Object.assign(Object.assign({}, message), { file: Object.assign(Object.assign({}, message.file), { url: message.file.url + `?grant=${this.readFileGrant}` }) });
        }
        else {
            return Object.assign({}, message);
        }
    }
}
function isGetChannelsRequest(param) {
    const request = param;
    return (request === null || request === void 0 ? void 0 : request.filter) !== undefined;
}
function isGetUsersRequest(param) {
    const request = param;
    return (request === null || request === void 0 ? void 0 : request.filter) !== undefined;
}
function isGetChannelsUnreadRequest(param) {
    const request = param;
    return (request === null || request === void 0 ? void 0 : request.filter) !== undefined;
}
function isGetUnreadMessagesCountRequest(param) {
    const request = param;
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
export default ChatKittyImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdGtpdHR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9jaGF0a2l0dHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLGVBQWUsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDOUMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTVDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUN2RCxPQUFPLE1BQU0sTUFBTSxXQUFXLENBQUM7QUFFL0IsT0FBTyxFQUdMLDJCQUEyQixFQUMzQixnQ0FBZ0MsRUFFaEMsd0JBQXdCLEVBQ3hCLCtCQUErQixFQUcvQixrQ0FBa0MsRUFHbEMsb0JBQW9CLEVBR3BCLG9CQUFvQixFQU1wQiwwQkFBMEIsRUFDMUIseUJBQXlCLEVBR3pCLCtCQUErQixFQUkvQiwwQkFBMEIsRUFDMUIsaUJBQWlCLEVBS2pCLG1CQUFtQixFQUduQixpQkFBaUIsRUFHakIsa0JBQWtCLEVBQ2xCLHNCQUFzQixFQUd0QiwwQkFBMEIsRUFHMUIsb0JBQW9CLEVBR3BCLG9CQUFvQixHQUNyQixNQUFNLFdBQVcsQ0FBQztBQUNuQixPQUFPLEVBSUwsd0JBQXdCLEdBQ3pCLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUdMLDhCQUE4QixFQUk5QixzQ0FBc0MsRUFDdEMsd0JBQXdCLEdBQ3pCLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUVMLG9CQUFvQixFQUdyQixNQUFNLFNBQVMsQ0FBQztBQUNqQixPQUFPLEVBQ0wscUJBQXFCLEdBR3RCLE1BQU0sUUFBUSxDQUFDO0FBT2hCLE9BQU8sRUFHTCxpQ0FBaUMsRUFHakMsNEJBQTRCLEVBQzVCLDRCQUE0QixFQU01QixpQ0FBaUMsRUFHakMsZ0NBQWdDLEVBR2hDLCtCQUErQixFQUsvQiwwQkFBMEIsRUFFMUIsYUFBYSxFQUViLHFCQUFxQixFQUdyQiww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