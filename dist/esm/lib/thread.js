import { ChatKittySucceededResult } from './result';
export class CreatedThreadResult extends ChatKittySucceededResult {
    constructor(thread) {
        super();
        this.thread = thread;
    }
}
export class GetThreadsSucceededResult extends ChatKittySucceededResult {
    constructor(paginator) {
        super();
        this.paginator = paginator;
    }
}
export class GetThreadChannelSucceededResult extends ChatKittySucceededResult {
    constructor(channel) {
        super();
        this.channel = channel;
    }
}
export class GetThreadMessageSucceededResult extends ChatKittySucceededResult {
    constructor(message) {
        super();
        this.message = message;
    }
}
export class ReadThreadSucceededResult extends ChatKittySucceededResult {
    constructor(thread) {
        super();
        this.thread = thread;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyZWFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi90aHJlYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUdMLHdCQUF3QixFQUN6QixNQUFNLFVBQVUsQ0FBQztBQThDbEIsTUFBTSxPQUFPLG1CQUFvQixTQUFRLHdCQUF3QjtJQUMvRCxZQUFtQixNQUFjO1FBQy9CLEtBQUssRUFBRSxDQUFDO1FBRFMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtJQUVqQyxDQUFDO0NBQ0Y7QUFtQkQsTUFBTSxPQUFPLHlCQUEwQixTQUFRLHdCQUF3QjtJQUNyRSxZQUFtQixTQUFxQztRQUN0RCxLQUFLLEVBQUUsQ0FBQztRQURTLGNBQVMsR0FBVCxTQUFTLENBQTRCO0lBRXhELENBQUM7Q0FDRjtBQVVELE1BQU0sT0FBTywrQkFBZ0MsU0FBUSx3QkFBd0I7SUFDM0UsWUFBbUIsT0FBZ0I7UUFDakMsS0FBSyxFQUFFLENBQUM7UUFEUyxZQUFPLEdBQVAsT0FBTyxDQUFTO0lBRW5DLENBQUM7Q0FDRjtBQVVELE1BQU0sT0FBTywrQkFBZ0MsU0FBUSx3QkFBd0I7SUFDM0UsWUFBbUIsT0FBZ0I7UUFDakMsS0FBSyxFQUFFLENBQUM7UUFEUyxZQUFPLEdBQVAsT0FBTyxDQUFTO0lBRW5DLENBQUM7Q0FDRjtBQVVELE1BQU0sT0FBTyx5QkFBMEIsU0FBUSx3QkFBd0I7SUFDckUsWUFBbUIsTUFBYztRQUMvQixLQUFLLEVBQUUsQ0FBQztRQURTLFdBQU0sR0FBTixNQUFNLENBQVE7SUFFakMsQ0FBQztDQUNGIn0=