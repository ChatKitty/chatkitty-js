import { ChatKittyError } from './error';
import { ChatKittySucceededResult } from './result';
export function isTextMessage(message) {
    return message.body !== undefined;
}
export function isFileMessage(message) {
    return message.file !== undefined;
}
export function isUserMessage(message) {
    return message.user !== undefined;
}
export function isSystemMessage(message) {
    return message.user === undefined;
}
export class GetMessagesSucceededResult extends ChatKittySucceededResult {
    constructor(paginator) {
        super();
        this.paginator = paginator;
    }
}
export class GetLastReadMessageSucceededResult extends ChatKittySucceededResult {
    constructor(message) {
        super();
        this.message = message;
    }
}
export class ReadMessageSucceededResult extends ChatKittySucceededResult {
    constructor(message) {
        super();
        this.message = message;
    }
}
export class EditedMessageSucceededResult extends ChatKittySucceededResult {
    constructor(message) {
        super();
        this.message = message;
    }
}
export class DeleteMessageForMeSucceededResult extends ChatKittySucceededResult {
    constructor(message) {
        super();
        this.message = message;
    }
}
export class DeleteMessageSucceededResult extends ChatKittySucceededResult {
    constructor(message) {
        super();
        this.message = message;
    }
}
export class SentTextMessageResult extends ChatKittySucceededResult {
    constructor(message) {
        super();
        this.message = message;
    }
}
export class SentFileMessageResult extends ChatKittySucceededResult {
    constructor(message) {
        super();
        this.message = message;
    }
}
export function sentTextMessage(result) {
    const message = result.message;
    return message !== undefined && message.type === 'TEXT';
}
export function sentFileMessage(result) {
    const message = result.message;
    return message !== undefined && message.type === 'FILE';
}
export class GetMessageChannelSucceededResult extends ChatKittySucceededResult {
    constructor(channel) {
        super();
        this.channel = channel;
    }
}
export class GetMessageParentSucceededResult extends ChatKittySucceededResult {
    constructor(message) {
        super();
        this.message = message;
    }
}
export class MessageNotAReplyError extends ChatKittyError {
    constructor(messageModel) {
        super('MessageNotAReplyError', `Message ${messageModel.id} is not a reply.`);
        this.messageModel = messageModel;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvbWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBUXpDLE9BQU8sRUFHTCx3QkFBd0IsRUFDekIsTUFBTSxVQUFVLENBQUM7QUE4R2xCLE1BQU0sVUFBVSxhQUFhLENBQUMsT0FBZ0I7SUFDNUMsT0FBUSxPQUF1QixDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7QUFDckQsQ0FBQztBQUVELE1BQU0sVUFBVSxhQUFhLENBQUMsT0FBZ0I7SUFDNUMsT0FBUSxPQUF1QixDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7QUFDckQsQ0FBQztBQUVELE1BQU0sVUFBVSxhQUFhLENBQUMsT0FBZ0I7SUFDNUMsT0FBUSxPQUF1QixDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7QUFDckQsQ0FBQztBQUVELE1BQU0sVUFBVSxlQUFlLENBQUMsT0FBZ0I7SUFDOUMsT0FBUSxPQUF1QixDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7QUFDckQsQ0FBQztBQTRCRCxNQUFNLE9BQU8sMEJBQTJCLFNBQVEsd0JBQXdCO0lBQ3RFLFlBQW1CLFNBQXNDO1FBQ3ZELEtBQUssRUFBRSxDQUFDO1FBRFMsY0FBUyxHQUFULFNBQVMsQ0FBNkI7SUFFekQsQ0FBQztDQUNGO0FBTUQsTUFBTSxPQUFPLGlDQUFrQyxTQUFRLHdCQUF3QjtJQUM3RSxZQUFtQixPQUFpQjtRQUNsQyxLQUFLLEVBQUUsQ0FBQztRQURTLFlBQU8sR0FBUCxPQUFPLENBQVU7SUFFcEMsQ0FBQztDQUNGO0FBVUQsTUFBTSxPQUFPLDBCQUEyQixTQUFRLHdCQUF3QjtJQUN0RSxZQUFtQixPQUFnQjtRQUNqQyxLQUFLLEVBQUUsQ0FBQztRQURTLFlBQU8sR0FBUCxPQUFPLENBQVM7SUFFbkMsQ0FBQztDQUNGO0FBV0QsTUFBTSxPQUFPLDRCQUE2QixTQUFRLHdCQUF3QjtJQUN4RSxZQUFtQixPQUFnQjtRQUNqQyxLQUFLLEVBQUUsQ0FBQztRQURTLFlBQU8sR0FBUCxPQUFPLENBQVM7SUFFbkMsQ0FBQztDQUNGO0FBVUQsTUFBTSxPQUFPLGlDQUFrQyxTQUFRLHdCQUF3QjtJQUM3RSxZQUFtQixPQUFnQjtRQUNqQyxLQUFLLEVBQUUsQ0FBQztRQURTLFlBQU8sR0FBUCxPQUFPLENBQVM7SUFFbkMsQ0FBQztDQUNGO0FBVUQsTUFBTSxPQUFPLDRCQUE2QixTQUFRLHdCQUF3QjtJQUN4RSxZQUFtQixPQUFnQjtRQUNqQyxLQUFLLEVBQUUsQ0FBQztRQURTLFlBQU8sR0FBUCxPQUFPLENBQVM7SUFFbkMsQ0FBQztDQUNGO0FBK0NELE1BQU0sT0FBTyxxQkFBc0IsU0FBUSx3QkFBd0I7SUFDakUsWUFBbUIsT0FBd0I7UUFDekMsS0FBSyxFQUFFLENBQUM7UUFEUyxZQUFPLEdBQVAsT0FBTyxDQUFpQjtJQUUzQyxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8scUJBQXNCLFNBQVEsd0JBQXdCO0lBQ2pFLFlBQW1CLE9BQXdCO1FBQ3pDLEtBQUssRUFBRSxDQUFDO1FBRFMsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7SUFFM0MsQ0FBQztDQUNGO0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FDN0IsTUFBeUI7SUFFekIsTUFBTSxPQUFPLEdBQUksTUFBZ0MsQ0FBQyxPQUFPLENBQUM7SUFFMUQsT0FBTyxPQUFPLEtBQUssU0FBUyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDO0FBQzFELENBQUM7QUFFRCxNQUFNLFVBQVUsZUFBZSxDQUM3QixNQUF5QjtJQUV6QixNQUFNLE9BQU8sR0FBSSxNQUFnQyxDQUFDLE9BQU8sQ0FBQztJQUUxRCxPQUFPLE9BQU8sS0FBSyxTQUFTLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7QUFDMUQsQ0FBQztBQWtCRCxNQUFNLE9BQU8sZ0NBQWlDLFNBQVEsd0JBQXdCO0lBQzVFLFlBQW1CLE9BQWdCO1FBQ2pDLEtBQUssRUFBRSxDQUFDO1FBRFMsWUFBTyxHQUFQLE9BQU8sQ0FBUztJQUVuQyxDQUFDO0NBQ0Y7QUFVRCxNQUFNLE9BQU8sK0JBQWdDLFNBQVEsd0JBQXdCO0lBQzNFLFlBQW1CLE9BQWdCO1FBQ2pDLEtBQUssRUFBRSxDQUFDO1FBRFMsWUFBTyxHQUFQLE9BQU8sQ0FBUztJQUVuQyxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8scUJBQXNCLFNBQVEsY0FBYztJQUN2RCxZQUFtQixZQUFxQjtRQUN0QyxLQUFLLENBQ0gsdUJBQXVCLEVBQ3ZCLFdBQVcsWUFBWSxDQUFDLEVBQUUsa0JBQWtCLENBQzdDLENBQUM7UUFKZSxpQkFBWSxHQUFaLFlBQVksQ0FBUztJQUt4QyxDQUFDO0NBQ0YifQ==