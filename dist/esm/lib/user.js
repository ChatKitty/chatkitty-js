import { ChatKittySucceededResult } from './result';
export class GetUsersSucceededResult extends ChatKittySucceededResult {
    constructor(paginator) {
        super();
        this.paginator = paginator;
    }
}
export class GetUserSucceededResult extends ChatKittySucceededResult {
    constructor(user) {
        super();
        this.user = user;
    }
}
export class GetUserIsChannelMemberSucceededResult extends ChatKittySucceededResult {
    constructor(isMember) {
        super();
        this.isMember = isMember;
    }
}
export class BlockUserSucceededResult extends ChatKittySucceededResult {
    constructor(user) {
        super();
        this.user = user;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBR0wsd0JBQXdCLEVBQ3pCLE1BQU0sVUFBVSxDQUFDO0FBOENsQixNQUFNLE9BQU8sdUJBQXdCLFNBQVEsd0JBQXdCO0lBQ25FLFlBQW1CLFNBQW1DO1FBQ3BELEtBQUssRUFBRSxDQUFDO1FBRFMsY0FBUyxHQUFULFNBQVMsQ0FBMEI7SUFFdEQsQ0FBQztDQUNGO0FBTUQsTUFBTSxPQUFPLHNCQUF1QixTQUFRLHdCQUF3QjtJQUNsRSxZQUFtQixJQUFVO1FBQzNCLEtBQUssRUFBRSxDQUFDO1FBRFMsU0FBSSxHQUFKLElBQUksQ0FBTTtJQUU3QixDQUFDO0NBQ0Y7QUFXRCxNQUFNLE9BQU8scUNBQXNDLFNBQVEsd0JBQXdCO0lBQ2pGLFlBQW1CLFFBQWlCO1FBQ2xDLEtBQUssRUFBRSxDQUFDO1FBRFMsYUFBUSxHQUFSLFFBQVEsQ0FBUztJQUVwQyxDQUFDO0NBQ0Y7QUFVRCxNQUFNLE9BQU8sd0JBQXlCLFNBQVEsd0JBQXdCO0lBQ3BFLFlBQW1CLElBQVU7UUFDM0IsS0FBSyxFQUFFLENBQUM7UUFEUyxTQUFJLEdBQUosSUFBSSxDQUFNO0lBRTdCLENBQUM7Q0FDRiJ9