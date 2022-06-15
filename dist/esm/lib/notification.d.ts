import { Channel } from './channel';
import { Message } from './message';
import { User } from './user';
export declare type Notification = SystemSentMessageNotification | UserSentMessageNotification | UserRepliedToMessageNotification | UserMentionedNotification | UserMentionedChannelNotification;
export interface BaseNotification {
    id: number;
    title: string;
    body: string;
    channel: Channel | null;
    data: unknown;
    muted: boolean;
    createdTime: string;
    readTime: string | null;
}
export declare type SystemSentMessageNotification = BaseNotification & {
    data: SystemSentMessageNotificationData;
};
export declare type UserSentMessageNotification = BaseNotification & {
    data: UserSentMessageNotificationData;
};
export declare type UserRepliedToMessageNotification = BaseNotification & {
    data: UserRepliedToMessageNotificationData;
};
export declare type UserMentionedNotification = BaseNotification & {
    data: UserMentionedNotificationData;
};
export declare type UserMentionedChannelNotification = BaseNotification & {
    data: UserMentionedChannelNotificationData;
};
export declare abstract class NotificationData {
    type: string;
    recipient: User;
}
export declare class SystemSentMessageNotificationData extends NotificationData {
    message: Message;
}
export declare class UserSentMessageNotificationData extends NotificationData {
    message: Message;
}
export declare class UserRepliedToMessageNotificationData extends NotificationData {
    message: Message;
    parent: Message;
}
export declare class UserMentionedNotificationData extends NotificationData {
    message: Message;
}
export declare class UserMentionedChannelNotificationData extends NotificationData {
    message: Message;
}
export declare function isSystemSentMessageNotification(notification: Notification): notification is SystemSentMessageNotification;
export declare function isUserSentMessageNotification(notification: Notification): notification is UserSentMessageNotification;
export declare function isUserRepliedToMessageNotification(notification: Notification): notification is UserRepliedToMessageNotification;
export declare function isUserMentionedNotification(notification: Notification): notification is UserMentionedNotification;
export declare function isUserMentionedChannelNotification(notification: Notification): notification is UserMentionedChannelNotification;
