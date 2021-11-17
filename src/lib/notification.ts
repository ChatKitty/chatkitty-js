import {Channel} from './channel';
import {Message} from './message';
import {User} from './user';

export type Notification =
  SystemSentMessageNotification |
  UserSentMessageNotification |
  UserRepliedToMessageNotification |
  UserMentionedNotification |
  UserMentionedChannelNotification;

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

export type SystemSentMessageNotification = BaseNotification & {
  data: SystemSentMessageNotificationData
}

export type UserSentMessageNotification = BaseNotification & {
  data: UserSentMessageNotificationData
}

export type UserRepliedToMessageNotification = BaseNotification & {
  data: UserRepliedToMessageNotificationData
}

export type UserMentionedNotification = BaseNotification & {
  data: UserMentionedNotificationData
}

export type UserMentionedChannelNotification = BaseNotification & {
  data: UserMentionedChannelNotificationData
}

export declare abstract class NotificationData {
  type: string
  recipient: User
}

export declare class SystemSentMessageNotificationData extends NotificationData {
  message: Message
}

export declare class UserSentMessageNotificationData extends NotificationData {
  message: Message
}

export declare class UserRepliedToMessageNotificationData extends NotificationData {
  message: Message
  parent: Message
}

export declare class UserMentionedNotificationData extends NotificationData {
  message: Message
}

export declare class UserMentionedChannelNotificationData extends NotificationData {
  message: Message
}

export function isSystemSentMessageNotification(
  notification: Notification
): notification is SystemSentMessageNotification {
  return notification.data.type === 'SYSTEM:SENT:MESSAGE';
}

export function isUserSentMessageNotification(
  notification: Notification
): notification is UserSentMessageNotification {
  return notification.data.type === 'USER:SENT:MESSAGE';
}

export function isUserRepliedToMessageNotification(
  notification: Notification
): notification is UserRepliedToMessageNotification {
  return notification.data.type === 'USER:REPLIED_TO:MESSAGE';
}

export function isUserMentionedNotification(
  notification: Notification
): notification is UserMentionedNotification {
  return notification.data.type === 'USER:MENTIONED:USER';
}

export function isUserMentionedChannelNotification(
  notification: Notification
): notification is UserMentionedChannelNotification {
  return notification.data.type === 'USER:MENTIONED:CHANNEL';
}
