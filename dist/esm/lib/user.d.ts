import { Channel } from './channel';
import { ChatKittyModelReference } from './model';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittyResult, ChatKittySucceededResult } from './result';
export interface BaseUser {
    id: number;
    name: string;
    displayName: string;
    displayPictureUrl: string;
    isGuest: boolean;
    presence: UserPresence;
    properties: unknown;
}
export declare class UserPresence {
    status: string;
    online: boolean;
}
export declare type User = BaseUser & {
    _relays: UserRelays;
};
export declare class UserRelays {
    self: string;
    channelMember: string;
}
export declare type ChatKittyUserReference = ChatKittyModelReference | {
    username: string;
};
export declare class GetUsersRequest {
    filter?: GetUsersFilter;
}
export declare class GetUsersFilter {
    name?: string;
    displayName?: string;
    online?: boolean;
}
export declare type GetUsersResult = ChatKittyResult<GetUsersSucceededResult> | GetUsersSucceededResult | ChatKittyFailedResult;
export declare class GetUsersSucceededResult extends ChatKittySucceededResult {
    paginator: ChatKittyPaginator<User>;
    constructor(paginator: ChatKittyPaginator<User>);
}
export declare type GetUserResult = ChatKittyResult<GetUserSucceededResult> | GetUserSucceededResult | ChatKittyFailedResult;
export declare class GetUserSucceededResult extends ChatKittySucceededResult {
    user: User;
    constructor(user: User);
}
export declare class GetUserIsChannelMemberRequest {
    user: User;
    channel: Channel;
}
export declare type GetUserIsChannelMemberResult = ChatKittyResult<GetUserIsChannelMemberSucceededResult> | GetUserIsChannelMemberSucceededResult | ChatKittyFailedResult;
export declare class GetUserIsChannelMemberSucceededResult extends ChatKittySucceededResult {
    isMember: boolean;
    constructor(isMember: boolean);
}
export declare class BlockUserRequest {
    user: User;
}
export declare type BlockUserResult = ChatKittyResult<BlockUserSucceededResult> | BlockUserSucceededResult | ChatKittyFailedResult;
export declare class BlockUserSucceededResult extends ChatKittySucceededResult {
    user: User;
    constructor(user: User);
}
