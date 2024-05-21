declare class ChatKittyFile {
    type: string;
    url: string;
    name: string;
    contentType: string;
    size: number;
}

declare class Emoji {
    character: string;
    description: string;
    aliases: string[];
    tags: string[];
}

interface BaseUser {
    id: number;
    name: string;
    displayName: string;
    displayPictureUrl: string;
    isGuest: boolean;
    presence: UserPresence;
    properties: any;
}
declare class UserPresence {
    status: string;
    online: boolean;
}
declare type User = BaseUser & {
    /** @internal */
    _relays: UserRelays;
};
declare class UserRelays {
    self: string;
    channelMember: string;
}

declare class ReactionSummary {
    emoji: Emoji;
    users: User[];
    count: number;
}

declare type Message = SystemMessage | UserMessage;
declare type SystemMessage = TextSystemMessage | FileSystemMessage;
declare type UserMessage = TextUserMessage | FileUserMessage;
interface BaseMessage {
    id: number;
    type: string;
    channelId: number;
    nestedLevel?: number;
    createdTime: string;
    groupTag?: string;
    reactions?: ReactionSummary[];
    repliesCount?: number;
    reportCount?: number;
    properties: unknown;
    /** @internal */
    _relays: MessageRelays;
    /** @internal */
    _actions: MessageActions;
    /** @internal */
    _streams: MessageStreams;
}
declare type BaseTextMessage = BaseMessage & {
    body: string;
    links: MessageLink[];
    mentions?: MessageMention[];
};
declare type BaseFileMessage = BaseMessage & {
    file: ChatKittyFile;
};
declare type BaseUserMessage = BaseMessage & {
    user: User;
};
declare type TextSystemMessage = BaseTextMessage & {
    type: 'SYSTEM_TEXT';
};
declare type FileSystemMessage = BaseFileMessage & {
    type: 'SYSTEM_FILE';
};
declare type TextUserMessage = BaseTextMessage & BaseUserMessage & {
    type: 'TEXT';
};
declare type FileUserMessage = BaseFileMessage & BaseUserMessage & {
    type: 'FILE';
};
declare class MessageLink {
    source: string;
    startPosition: number;
    endPosition: number;
    preview?: MessageLinkPreview;
}
declare class MessageLinkPreview {
    url: string;
    title: string;
    image: MessageLinkPreviewImage;
    description?: string;
    siteName?: string;
}
declare class MessageLinkPreviewImage {
    source: string;
}
declare type MessageMention = ChannelMessageMention | UserMessageMention;
interface BaseMessageMention {
    type: string;
    tag: string;
    startPosition: number;
    endPosition: number;
}
declare type ChannelMessageMention = BaseMessageMention & {
    channel: Channel;
};
declare type UserMessageMention = BaseMessageMention & {
    user: User;
};
declare class MessageRelays {
    self: string;
    channel: string;
    parent?: string;
    readReceipts: string;
    repliesCount: string;
    reportCount: string;
    replies: string;
    reactions: string;
    reports: string;
}
declare class MessageActions {
    read: string;
    unread: string;
    reply: string;
    deleteForMe: string;
    delete: string;
    react: string;
    edit: string;
    report: string;
    removeReport: string;
    removeReaction: string;
    updateProperties: string;
}
declare class MessageStreams {
    replies: string;
}

declare type Channel = DirectChannel | PublicChannel | PrivateChannel;
interface BaseChannel {
    id: number;
    name: string;
    creator?: User;
    lastReceivedMessage?: Message;
    createdTime: string;
    properties: any;
    /** @internal */
    _relays: ChannelRelays;
    /** @internal */
    _topics: ChannelTopics;
    /** @internal */
    _actions: ChannelActions;
    /** @internal */
    _streams: ChannelStreams;
}
interface GroupChannel extends BaseChannel {
    displayName: string;
}
declare type DirectChannel = BaseChannel & {
    type: 'DIRECT';
    members: User[];
};
declare type PublicChannel = GroupChannel & {
    type: 'PUBLIC';
};
declare type PrivateChannel = GroupChannel & {
    type: 'PRIVATE';
};
declare class ChannelRelays {
    self: string;
    context: string;
    messages: string;
    messagesCount: string;
    lastReceivedMessage: string;
    lastReadMessage: string;
    unread: string;
    members: string;
    threads: string;
    calls: string;
}
declare class ChannelTopics {
    self: string;
    messages: string;
    keystrokes: string;
    typing: string;
    participants: string;
    readReceipts: string;
    reactions: string;
    events: string;
}
declare class ChannelActions {
    message: string;
    keystrokes: string;
    join?: string;
    leave?: string;
    addModerator?: string;
    invite?: string;
    read: string;
    mute: string;
    call: string;
    triggerEvent: string;
    update: string;
    delete: string;
    clearHistory: string;
    hide: string;
    createThread: string;
}
declare class ChannelStreams {
    messages: string;
}

declare type CurrentUser = BaseUser & {
    /** @internal */
    _relays: CurrentUserRelays;
    /** @internal */
    _topics: CurrentUserTopics;
    /** @internal */
    _actions: CurrentUserActions;
    /** @internal */
    _streams: CurrentUserStreams;
};
declare class CurrentUserRelays {
    self: string;
    readFileAccessGrant: string;
    writeFileAccessGrant: string;
    channelsCount: string;
    channels: string;
    messages: string;
    joinableChannels: string;
    unreadChannelsCount: string;
    unreadChannels: string;
    unreadMessagesCount: string;
    contactsCount: string;
    contacts: string;
    userBlockedRecords: string;
}
declare class CurrentUserTopics {
    self: string;
    elements: string;
    features: string;
    styles: string;
    channels: string;
    messages: string;
    readReceipts: string;
    notifications: string;
    contacts: string;
    participants: string;
    users: string;
    reactions: string;
    threads: string;
    calls: string;
}
declare class CurrentUserActions {
    update: string;
    createChannel: string;
    updateDisplayPicture: string;
}
declare class CurrentUserStreams {
    displayPicture: string;
}

declare type ClassMap = Record<string, string>;
declare type ClassMaps = {
    [key: string]: ClassMap;
};
declare type UiElement = {
    template: string;
    classMaps: ClassMaps;
};
declare type UiElements = {
    [key: string]: UiElement;
};

declare type Notification = SystemSentMessageNotification | UserSentMessageNotification | UserRepliedToMessageNotification | UserMentionedNotification | UserMentionedChannelNotification;
interface BaseNotification {
    id: number;
    title: string;
    body: string;
    channel: Channel | null;
    data: unknown;
    muted: boolean;
    createdTime: string;
    readTime: string | null;
}
declare type SystemSentMessageNotification = BaseNotification & {
    data: SystemSentMessageNotificationData;
};
declare type UserSentMessageNotification = BaseNotification & {
    data: UserSentMessageNotificationData;
};
declare type UserRepliedToMessageNotification = BaseNotification & {
    data: UserRepliedToMessageNotificationData;
};
declare type UserMentionedNotification = BaseNotification & {
    data: UserMentionedNotificationData;
};
declare type UserMentionedChannelNotification = BaseNotification & {
    data: UserMentionedChannelNotificationData;
};
declare abstract class NotificationData {
    type: string;
    recipient: User;
}
declare class SystemSentMessageNotificationData extends NotificationData {
    message: Message;
}
declare class UserSentMessageNotificationData extends NotificationData {
    message: Message;
}
declare class UserRepliedToMessageNotificationData extends NotificationData {
    message: Message;
    parent: Message;
}
declare class UserMentionedNotificationData extends NotificationData {
    message: Message;
}
declare class UserMentionedChannelNotificationData extends NotificationData {
    message: Message;
}

/**
 * JSON schema for configuring the ChatKitty Chat UI theme options. It's designed to be intuitive and easy to understand for front-end developers, designers, and product managers alike.
 */
interface ChatUIThemeStylingOptions {
    $version: "0.0.2";
    /**
     * The base theme to use for the Chat UI. This will be used as the default theme for all components.
     */
    "base-theme": "light" | "dark";
    /**
     * A custom stylesheet to be applied across the Chat UI. This will be applied after the base theme and component overrides.
     */
    stylesheet?: string;
    /**
     * Overrides for specific components. These will override the base theme for the specified component.
     */
    overrides?: {
        /**
         * General overrides for all components.
         */
        general?: {
            /**
             * Text overrides for all components.
             */
            text?: {
                /**
                 * The color of text.
                 */
                color?: string;
            };
            /**
             * Button overrides for all components.
             */
            button?: {
                /**
                 * Clear button overrides for all components.
                 */
                clear?: {
                    /**
                     * The color of the clear button.
                     */
                    color?: string;
                };
                /**
                 * The default color of buttons.
                 */
                color?: string;
                /**
                 * The default background color of buttons.
                 */
                "background-color"?: string;
            };
            /**
             * Text input overrides for all components.
             */
            input?: {
                /**
                 * The background color of text inputs.
                 */
                "background-color"?: string;
                /**
                 * Input placeholder text overrides for all components.
                 */
                placeholder?: {
                    /**
                     * The color of placeholder text.
                     */
                    color?: string;
                };
                /**
                 * Text input caret overrides for all components.
                 */
                caret?: {
                    /**
                     * The color of the caret.
                     */
                    color?: string;
                };
            };
            /**
             * Spinner overrides for all components.
             */
            spinner?: {
                /**
                 * The color of spinners.
                 */
                color?: string;
            };
            /**
             * Border overrides for all components.
             */
            border?: {
                /**
                 * The CSS style of borders.
                 */
                style?: string;
            };
        };
        /**
         * Chat container overrides.
         */
        container?: {
            /**
             * Chat container border overrides.
             */
            border?: {
                /**
                 * The CSS style of chat container borders.
                 */
                style?: string;
                /**
                 * The CSS radius of chat container borders.
                 */
                radius?: string;
            };
            /**
             * The CSS box shadow of chat containers.
             */
            "box-shadow"?: string;
        };
        /**
         * Chat header overrides.
         */
        header?: {
            /**
             * The background color of chat headers.
             */
            "background-color"?: string;
            /**
             * Chat header channel overrides.
             */
            channel?: {
                name?: {
                    /**
                     * The color of chat header channel names.
                     */
                    color?: string;
                };
                description?: {
                    /**
                     * The color of chat header channel descriptions.
                     */
                    color?: string;
                };
            };
        };
        /**
         * Chat footer overrides.
         */
        footer?: {
            /**
             * The background color of chat footers.
             */
            "background-color"?: string;
            /**
             * Chat footer input overrides.
             */
            input?: {
                /**
                 * Chat footer input border overrides.
                 */
                border?: {
                    /**
                     * The CSS style of chat footer input borders.
                     */
                    style?: string;
                    /**
                     * The CSS style of chat footer input borders when selected.
                     */
                    selected?: string;
                };
            };
            /**
             * Chat footer reply overrides.
             */
            reply?: {
                /**
                 * The background color of chat footer replies.
                 */
                "background-color"?: string;
            };
            /**
             * Chat footer tag overrides.
             */
            tag?: {
                /**
                 * Chat footer active tag overrides.
                 */
                active?: {
                    /**
                     * The background color of chat footer active tags.
                     */
                    "background-color"?: string;
                };
                /**
                 * The background color of chat footer tags.
                 */
                "background-color"?: string;
            };
        };
        /**
         * Chat content overrides.
         */
        content?: {
            /**
             * The background color of chat content.
             */
            "background-color"?: string;
        };
        /**
         * Chat side menu overrides.
         */
        "side-menu"?: {
            /**
             * The background color of chat side menus.
             */
            "background-color"?: string;
            /**
             * Chat side menu hover overrides.
             */
            hover?: {
                /**
                 * The background color of chat side menu hover states.
                 */
                "background-color"?: string;
            };
            /**
             * Chat side menu active overrides.
             */
            active?: {
                /**
                 * The background color of chat side menu active states.
                 */
                "background-color"?: string;
                /**
                 * The color of chat side menu active states.
                 */
                color?: string;
            };
            /**
             * Chat side menu search overrides.
             */
            search?: {
                /**
                 * Chat side menu search border overrides.
                 */
                border?: {
                    /**
                     * The color of chat side menu search borders.
                     */
                    color?: string;
                };
            };
        };
        /**
         * Chat dropdown overrides.
         */
        dropdown?: {
            /**
             * The background color of chat dropdowns.
             */
            "background-color"?: string;
            hover?: {
                /**
                 * The background color of chat dropdown hover states.
                 */
                "background-color"?: string;
            };
        };
        /**
         * Chat message overrides.
         */
        message?: {
            /**
             * Chat inbound message overrides (messages sent by other users and received by the current user).
             */
            inbound?: {
                /**
                 * The background color of chat inbound messages.
                 */
                "background-color"?: string;
            };
            /**
             * Chat outbound message overrides (messages sent by the current user).
             */
            outbound?: {
                /**
                 * The background color of chat outbound messages.
                 */
                "background-color"?: string;
            };
            /**
             * Chat message text overrides.
             */
            text?: {
                /**
                 * The color of chat message text.
                 */
                color?: string;
            };
            /**
             * Chat draft message overrides (messages started but not sent).
             */
            draft?: {
                /**
                 * Chat draft message text overrides.
                 */
                text?: {
                    /**
                     * The color of chat draft message text.
                     */
                    color?: string;
                };
            };
            /**
             * Chat deleted message overrides (messages deleted by the current user).
             */
            deleted?: {
                /**
                 * The background color of chat deleted messages.
                 */
                "background-color"?: string;
                /**
                 * The color of chat deleted message text.
                 */
                color?: string;
            };
            /**
             * Chat selected message overrides.
             */
            selected?: {
                /**
                 * The background color of chat selected messages.
                 */
                "background-color"?: string;
            };
            /**
             * Chat message user overrides.
             */
            user?: {
                /**
                 * Chat message user display name overrides.
                 */
                "display-name"?: {
                    /**
                     * The color of chat message user display names.
                     */
                    color?: string;
                };
            };
            /**
             * Chat message timestamp overrides.
             */
            timestamp?: {
                /**
                 * The color of chat message timestamps.
                 */
                color?: string;
            };
            /**
             * Chat message date overrides.
             */
            date?: {
                /**
                 * The background color of chat message dates.
                 */
                "background-color"?: string;
                /**
                 * The color of chat message dates.
                 */
                color?: string;
            };
            /**
             * Chat system message overrides.
             */
            system?: {
                /**
                 * The background color of chat system messages.
                 */
                "background-color"?: string;
                /**
                 * The color of chat system message text.
                 */
                color?: string;
            };
            media?: {
                /**
                 * The background color of chat media messages.
                 */
                "background-color"?: string;
            };
            /**
             * Chat reply message overrides.
             */
            reply?: {
                /**
                 * The background color of chat reply messages.
                 */
                "background-color"?: string;
                /**
                 * The color of chat reply message text.
                 */
                color?: string;
                /**
                 * Chat reply message user overrides.
                 */
                user?: {
                    /**
                     * Chat reply message user display name overrides.
                     */
                    "display-name"?: {
                        /**
                         * The color of chat reply message user display names.
                         */
                        color?: string;
                    };
                };
            };
            /**
             * Chat message tag overrides.
             */
            tag?: {
                /**
                 * The color of chat message tags.
                 */
                color?: string;
            };
            /**
             * Chat message image overrides.
             */
            image?: {
                /**
                 * The background color of chat message images.
                 */
                "background-color"?: string;
            };
            /**
             * New (recently received) chat messages overrides.
             */
            new?: {
                /**
                 * The color of new chat message text.
                 */
                color?: string;
                /**
                 * New messages counter overrides.
                 */
                counter?: {
                    /**
                     * The background color of the new messages counter.
                     */
                    "background-color"?: string;
                    /**
                     * The color of the new messages counter.
                     */
                    color?: string;
                };
            };
            /**
             * Chat message reaction overrides.
             */
            reaction?: {
                /**
                 * Outbound chat message reaction overrides. (reactions created by the current user)
                 */
                outbound?: {
                    /**
                     * The background color of outbound chat message reactions.
                     */
                    "background-color"?: string;
                    /**
                     * Outbound chat message reaction border overrides.
                     */
                    border?: {
                        /**
                         * The CSS style of outbound chat message reaction borders.
                         */
                        style?: string;
                    };
                    /**
                     * Outbound chat message reaction hover overrides.
                     */
                    hover?: {
                        /**
                         * The background color of outbound chat message reaction hover states.
                         */
                        "background-color"?: string;
                        /**
                         * Outbound chat message reaction hover border overrides.
                         */
                        border?: {
                            /**
                             * The CSS style of outbound chat message reaction hover borders.
                             */
                            style?: string;
                        };
                    };
                    /**
                     * Outbound chat message reaction counter overrides.
                     */
                    counter?: {
                        /**
                         * The color of outbound chat message reaction counters.
                         */
                        color?: string;
                    };
                };
                /**
                 * Inbound chat message reaction overrides. (reactions created by other users)
                 */
                inbound?: {
                    /**
                     * The background color of inbound chat message reactions.
                     */
                    "background-color"?: string;
                    /**
                     * Inbound chat message reaction border overrides.
                     */
                    border?: {
                        /**
                         * The CSS style of inbound chat message reaction borders.
                         */
                        style?: string;
                    };
                    /**
                     * Inbound chat message reaction hover overrides.
                     */
                    hover?: {
                        /**
                         * The background color of inbound chat message reaction hover states.
                         */
                        "background-color"?: string;
                        /**
                         * Inbound chat message reaction hover border overrides.
                         */
                        border?: {
                            /**
                             * The CSS style of inbound chat message reaction hover borders.
                             */
                            style?: string;
                        };
                    };
                    /**
                     * Inbound chat message reaction counter overrides.
                     */
                    counter?: {
                        /**
                         * The color of inbound chat message reaction counters.
                         */
                        color?: string;
                    };
                };
            };
            /**
             * Chat message audio overrides.
             */
            audio?: {
                /**
                 * Chat message audio record overrides.
                 */
                record?: {
                    /**
                     * The background color of chat message audio record states.
                     */
                    "background-color"?: string;
                };
                /**
                 * Chat message audio progress overrides.
                 */
                progress?: {
                    /**
                     * The background color of chat message audio progress states.
                     */
                    "background-color"?: string;
                    /**
                     * Chat message audio progress line overrides.
                     */
                    line?: {
                        /**
                         * The background color of chat message audio progress line states.
                         */
                        "background-color"?: string;
                    };
                    /**
                     * Chat message audio progress selector overrides.
                     */
                    selector?: {
                        /**
                         * The background color of chat message audio progress selectors.
                         */
                        "background-color"?: string;
                    };
                };
            };
            /**
             * Chat message file overrides.
             */
            file?: {
                /**
                 * Chat message file extension overrides.
                 */
                extension?: {
                    /**
                     * The color of chat message file extensions.
                     */
                    color?: string;
                };
            };
        };
        /**
         * Chat markdown overrides.
         */
        markdown?: {
            /**
             * The background color of chat markdown.
             */
            "background-color"?: string;
            /**
             * Chat markdown border overrides.
             */
            border?: {
                /**
                 * The color of chat markdown borders.
                 */
                color?: string;
            };
            /**
             * Chat markdown text overrides.
             */
            text?: {
                /**
                 * The color of chat markdown text.
                 */
                color?: string;
            };
            /**
             * Chat markdown code overrides.
             */
            code?: {
                /**
                 * Chat markdown multi-line code overrides.
                 */
                "multi-line"?: {
                    /**
                     * The color of chat markdown multi-line code.
                     */
                    color?: string;
                };
            };
        };
        /**
         * Channels list overrides.
         */
        channels?: {
            /**
             * Channels item overrides.
             */
            item?: {
                /**
                 * Channel display name overrides.
                 */
                "display-name"?: {
                    /**
                     * The color of channel display names.
                     */
                    color?: string;
                };
                /**
                 * Channel last message overrides.
                 */
                "last-message"?: {
                    /**
                     * The color of channel last messages.
                     */
                    color?: string;
                    /**
                     * Channel last message timestamp overrides.
                     */
                    timestamp?: {
                        /**
                         * The color of channel last message timestamps.
                         */
                        color?: string;
                    };
                };
                /**
                 * Channel user overrides. (DMs only)
                 */
                user?: {
                    /**
                     * Channel user presence overrides.
                     */
                    presence?: {
                        /**
                         * Channel user presence status overrides.
                         */
                        status?: {
                            /**
                             * Channel user presence online status overrides.
                             */
                            online?: {
                                /**
                                 * The color of channel user presence online status.
                                 */
                                color?: string;
                            };
                            /**
                             * Channel user presence offline status overrides.
                             */
                            offline?: {
                                /**
                                 * The color of channel user presence offline status.
                                 */
                                color?: string;
                            };
                        };
                    };
                };
                /**
                 * Channel unread messages overrides.
                 */
                unread?: {
                    /**
                     * Channel unread message counter overrides.
                     */
                    counter?: {
                        /**
                         * The background color of channel unread message counters.
                         */
                        "background-color"?: string;
                        /**
                         * The color of channel unread message counters.
                         */
                        color?: string;
                    };
                };
            };
        };
        /**
         * Emoji picker overrides.
         */
        emoji?: {
            /**
             * The emoji picker background color.
             */
            "background-color"?: string;
        };
        /**
         * Icon overrides.
         */
        icons?: {
            /**
             * Scroll icon overrides.
             */
            scroll?: {
                /**
                 * The background color of scroll icons.
                 */
                "background-color"?: string;
            };
            /**
             * Search icon overrides.
             */
            search?: {
                /**
                 * The color of search icons.
                 */
                color?: string;
            };
            /**
             * Add icon overrides.
             */
            add?: {
                /**
                 * The color of add icons.
                 */
                color?: string;
            };
            /**
             * Toggle icon overrides.
             */
            toggle?: {
                /**
                 * The color of toggle icons.
                 */
                color?: string;
            };
            /**
             * Menu icon overrides.
             */
            menu?: {
                /**
                 * The color of menu icons.
                 */
                color?: string;
            };
            /**
             * Close icon overrides.
             */
            close?: {
                /**
                 * The color of close icons.
                 */
                color?: string;
                /**
                 * Close icon image overrides.
                 */
                image?: {
                    /**
                     * The color of close icon images.
                     */
                    color?: string;
                };
                /**
                 * Close icon outline overrides.
                 */
                outline?: {
                    /**
                     * The color of close icon outlines.
                     */
                    color?: string;
                };
                /**
                 * Close icon preview overrides.
                 */
                preview?: {
                    /**
                     * The color of close icon previews.
                     */
                    color?: string;
                };
            };
            /**
             * File icon overrides.
             */
            file?: {
                /**
                 * The color of file icons.
                 */
                color?: string;
            };
            /**
             * Paperclip icon overrides.
             */
            paperclip?: {
                /**
                 * The color of paperclip icons.
                 */
                color?: string;
            };
            /**
             * Send icon overrides.
             */
            send?: {
                /**
                 * The color of send icons.
                 */
                color?: string;
                /**
                 * Send icon disabled overrides.
                 */
                disabled?: {
                    /**
                     * The color of disabled send icons.
                     */
                    color?: string;
                };
            };
            /**
             * Emoji icon overrides.
             */
            emoji?: {
                /**
                 * The color of emoji icons.
                 */
                color?: string;
            };
            /**
             * Reaction icon overrides.
             */
            reaction?: {
                /**
                 * The color of reaction icons.
                 */
                color?: string;
            };
            /**
             * Document icon overrides.
             */
            document?: {
                /**
                 * The color of document icons.
                 */
                color?: string;
            };
            /**
             * Pencil icon overrides.
             */
            pencil?: {
                /**
                 * The color of pencil icons.
                 */
                color?: string;
            };
            /**
             * Delivered message status icon overrides.
             */
            delivered?: {
                /**
                 * The color of delivered icons.
                 */
                color?: string;
            };
            /**
             * Read message status icon overrides.
             */
            read?: {
                /**
                 * The color of read icons.
                 */
                color?: string;
            };
            /**
             * Microphone icon overrides.
             */
            microphone?: {
                /**
                 * The color of microphone icons.
                 */
                color?: string;
            };
            /**
             * Audio icon overrides.
             */
            audio?: {
                /**
                 * Audio play icon overrides.
                 */
                play?: {
                    /**
                     * The color of audio play icons.
                     */
                    color?: string;
                };
                /**
                 * Audio pause icon overrides.
                 */
                pause?: {
                    /**
                     * The color of audio pause icons.
                     */
                    color?: string;
                };
                /**
                 * Audio cancel icon overrides.
                 */
                cancel?: {
                    /**
                     * The color of audio cancel icons.
                     */
                    color?: string;
                };
                /**
                 * Audio confirm icon overrides.
                 */
                confirm?: {
                    /**
                     * The color of audio confirm icons.
                     */
                    color?: string;
                };
            };
            /**
             * Preview icon overrides.
             */
            preview?: {
                /**
                 * The color of preview icons.
                 */
                color?: string;
            };
        };
    };
}

interface Observer<T> {
    next: (value: T) => void;
    error: (error: any) => void;
    complete: () => void;
}
interface Subscription {
    unsubscribe: () => void;
}
interface Reactive<T> {
    watch: (observer?: Partial<Observer<T>> | ((value: T) => void)) => Subscription;
}
interface ReactiveStream<T> extends Reactive<T> {
}
interface ReactiveValue<T> extends Reactive<T> {
    readonly value: T;
}

declare type Environment = any;
interface ApiConnection {
    user: ReactiveValue<CurrentUser>;
    notifications: ReactiveStream<Notification>;
    unreadChannelsCount: ReactiveValue<number>;
    unreadMessagesCount: ReactiveValue<number>;
    updateUser(user: Partial<CurrentUser>): Promise<void>;
    dispose(): Promise<void>;
}
declare class ConnectApiOptions {
    apiKey: string;
    username: string;
    authParams?: any;
    $environment?: Environment;
}

declare type Theme = 'light' | 'dark';
declare type Authentication = {
    type: string;
} & (UnsecuredAuthentication | AuthParamsAuthentication);
declare type UnsecuredAuthentication = {
    type: 'unsecured';
};
declare type AuthParamsAuthentication = {
    type: 'auth-params';
    params: any;
};
declare type Route = DirectMessagesRoute | ChannelRoute | EventRoute;
declare type NavigatableRoute = {
    name: string;
    allowNavigation?: boolean;
};
declare type DirectMessagesRoute = {
    name: 'direct-messages';
    users: string[];
} & NavigatableRoute;
declare type ChannelRoute = {
    name: 'channel';
    channel: string;
} & NavigatableRoute;
declare type EventRoute = {
    name: 'event';
    event: string;
};
declare type UserProfile = {
    displayName: string;
    displayPicture?: string;
};
declare type MenuActionType = {
    name: string;
    title: string;
};
declare type MenuAction = {
    name: string;
    channel: Channel;
};
declare type LocalizationContext = {
    locale: string;
};
declare type LocalizationStrings = {
    'chat:channels_empty'?: string;
    'chat:channel_empty'?: string;
    'chat:new_messages'?: string;
    'chat:message_deleted'?: string;
    'chat:messages_empty'?: string;
    'chat:chat_started'?: string;
    'chat:type_message'?: string;
    'chat:search'?: string;
    'chat:is_online'?: string;
    'chat:last_seen'?: string;
    'chat:is_typing'?: string;
    'chat:cancel_select_message'?: string;
    'chat:menu_action:mark_as_read'?: string;
    'chat:message_selection_action:copy'?: string;
};
declare type Localization = (context: LocalizationContext) => LocalizationStrings;
declare type AudioSound = {
    src?: string;
    muted?: boolean;
};
declare type Audio = {
    enabled?: boolean;
    sounds?: {
        'chat:message_sent'?: AudioSound;
        'chat:message_received'?: AudioSound;
    };
};
declare type ChatUiContainer = {
    id?: string;
    reference?: HTMLElement;
    height?: string;
    width?: string;
    responsive?: {
        small?: {
            breakpoint: number;
        };
    };
};
declare type ChatComponentContext = {
    locale: string;
};
declare type ChatComponent = (context: ChatComponentContext) => {
    menuActions?: MenuActionType[];
    onMounted?: () => void;
    onHeaderSelected?: (channel: Channel) => void;
    onMenuActionSelected?: (action: MenuAction) => void;
};
declare type Components = {
    chat: ChatComponent;
};
declare type ErrorTemplateContext = {
    message: string;
};
interface Template {
}
declare type ErrorTemplate = (options: ErrorTemplateContext) => Template;
declare type Templates = {
    error?: ErrorTemplate;
    elements?: UiElements;
};
declare type ChatUi = {
    unmount(): Promise<void>;
};
declare type ChatUiOptions = {
    widgetId: string;
    username?: string;
    locale?: string;
    container?: ChatUiContainer;
    theme?: Theme;
    styles?: Partial<ChatUIThemeStylingOptions>;
    authentication?: Authentication;
    profile?: UserProfile;
    route?: Route;
    localization?: Localization;
    audio?: Audio;
    components?: Components;
    templates?: Templates;
};
declare type LoadChatUiOptions = {
    connection?: ApiConnection;
    timeout?: number;
    $environment?: Environment;
};

declare const connectApi: (options: ConnectApiOptions) => Promise<ApiConnection>;

declare const template: (template: string) => Template;
declare const loadChatUi: (ui: ChatUiOptions, options?: LoadChatUiOptions) => ChatUi;

export { connectApi, loadChatUi, template };
