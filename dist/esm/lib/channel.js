import { ChatKittyError } from './error';
import { ChatKittySucceededResult } from './result';
export function isDirectChannel(channel) {
    return channel.type === 'DIRECT';
}
export function isPublicChannel(channel) {
    return channel.type === 'PUBLIC';
}
export function isPrivateChannel(channel) {
    return channel.type === 'PRIVATE';
}
export class CreatedChannelResult extends ChatKittySucceededResult {
    constructor(channel) {
        super();
        this.channel = channel;
    }
}
export class GetChannelsSucceededResult extends ChatKittySucceededResult {
    constructor(paginator) {
        super();
        this.paginator = paginator;
    }
}
export class GetChannelSucceededResult extends ChatKittySucceededResult {
    constructor(channel) {
        super();
        this.channel = channel;
    }
}
export class GetChannelUnreadSucceededResult extends ChatKittySucceededResult {
    constructor(unread) {
        super();
        this.unread = unread;
    }
}
export class JoinedChannelResult extends ChatKittySucceededResult {
    constructor(channel) {
        super();
        this.channel = channel;
    }
}
export class ChannelNotPubliclyJoinableError extends ChatKittyError {
    constructor(channel) {
        super('ChannelNotPubliclyJoinableError', `The channel ${channel.name} can't be joined without an invite.`);
        this.channel = channel;
    }
}
export class AddedChannelModeratorResult extends ChatKittySucceededResult {
    constructor(channel) {
        super();
        this.channel = channel;
    }
}
export class CannotAddModeratorToChannelError extends ChatKittyError {
    constructor(channel) {
        super('CannotAddModeratorToChannel', `The channel ${channel.name} is not a group channel and cannot have moderators.`);
        this.channel = channel;
    }
}
export class MutedChannelResult extends ChatKittySucceededResult {
    constructor(channel) {
        super();
        this.channel = channel;
    }
}
export class UnmutedChannelResult extends ChatKittySucceededResult {
    constructor(channel) {
        super();
        this.channel = channel;
    }
}
export class LeftChannelResult extends ChatKittySucceededResult {
    constructor(channel) {
        super();
        this.channel = channel;
    }
}
export class NotAChannelMemberError extends ChatKittyError {
    constructor(channel) {
        super('NotAChannelMemberError', `You are not a member of channel ${channel.name}.`);
        this.channel = channel;
    }
}
export class ReadChannelSucceededResult extends ChatKittySucceededResult {
    constructor(channel) {
        super();
        this.channel = channel;
    }
}
export class ClearChannelHistorySucceededResult extends ChatKittySucceededResult {
    constructor(channel) {
        super();
        this.channel = channel;
    }
}
export class HideChannelSucceededResult extends ChatKittySucceededResult {
    constructor(channel) {
        super();
        this.channel = channel;
    }
}
export class InvitedUserResult extends ChatKittySucceededResult {
    constructor(user) {
        super();
        this.user = user;
    }
}
export class ChannelNotInvitableError extends ChatKittyError {
    constructor(channel) {
        super('ChannelNotInvitableError', `The channel ${channel.name} does not accept invites.`);
        this.channel = channel;
    }
}
export class UpdatedChannelResult extends ChatKittySucceededResult {
    constructor(channel) {
        super();
        this.channel = channel;
    }
}
export class DeletedChannelResult extends ChatKittySucceededResult {
    constructor() {
        super();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBR3pDLE9BQU8sRUFHTCx3QkFBd0IsRUFDekIsTUFBTSxVQUFVLENBQUM7QUF1RWxCLE1BQU0sVUFBVSxlQUFlLENBQUMsT0FBZ0I7SUFDOUMsT0FBTyxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQztBQUNuQyxDQUFDO0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxPQUFnQjtJQUM5QyxPQUFPLE9BQU8sQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDO0FBQ25DLENBQUM7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsT0FBZ0I7SUFDL0MsT0FBTyxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQztBQUNwQyxDQUFDO0FBY0QsTUFBTSxPQUFPLG9CQUFxQixTQUFRLHdCQUF3QjtJQUNoRSxZQUFtQixPQUFnQjtRQUNqQyxLQUFLLEVBQUUsQ0FBQztRQURTLFlBQU8sR0FBUCxPQUFPLENBQVM7SUFFbkMsQ0FBQztDQUNGO0FBNkJELE1BQU0sT0FBTywwQkFBMkIsU0FBUSx3QkFBd0I7SUFDdEUsWUFBbUIsU0FBc0M7UUFDdkQsS0FBSyxFQUFFLENBQUM7UUFEUyxjQUFTLEdBQVQsU0FBUyxDQUE2QjtJQUV6RCxDQUFDO0NBQ0Y7QUFPRCxNQUFNLE9BQU8seUJBQTBCLFNBQVEsd0JBQXdCO0lBQ3JFLFlBQW1CLE9BQWdCO1FBQ2pDLEtBQUssRUFBRSxDQUFDO1FBRFMsWUFBTyxHQUFQLE9BQU8sQ0FBUztJQUVuQyxDQUFDO0NBQ0Y7QUFPRCxNQUFNLE9BQU8sK0JBQWdDLFNBQVEsd0JBQXdCO0lBQzNFLFlBQW1CLE1BQWU7UUFDaEMsS0FBSyxFQUFFLENBQUM7UUFEUyxXQUFNLEdBQU4sTUFBTSxDQUFTO0lBRWxDLENB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