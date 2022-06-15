export class ChatKittySucceededResult {
    constructor() {
        this.succeeded = true;
        this.cancelled = false;
        this.failed = false;
    }
}
export class ChatKittyCancelledResult {
    constructor() {
        this.succeeded = false;
        this.cancelled = true;
        this.failed = false;
    }
}
export class ChatKittyFailedResult {
    constructor(error) {
        this.error = error;
        this.succeeded = false;
        this.cancelled = false;
        this.failed = true;
    }
}
export class GetCountSucceedResult extends ChatKittySucceededResult {
    constructor(count) {
        super();
        this.count = count;
    }
}
export function succeeded(result) {
    return result.succeeded;
}
export function failed(result) {
    return result.failed;
}
export function cancelled(result) {
    return result.cancelled;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9yZXN1bHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBU0EsTUFBTSxPQUFnQix3QkFBd0I7SUFBOUM7UUFDRSxjQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFDbEIsV0FBTSxHQUFHLEtBQUssQ0FBQztJQUNqQixDQUFDO0NBQUE7QUFFRCxNQUFNLE9BQWdCLHdCQUF3QjtJQUE5QztRQUNFLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFDbEIsY0FBUyxHQUFHLElBQUksQ0FBQztRQUNqQixXQUFNLEdBQUcsS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQUVELE1BQU0sT0FBTyxxQkFBcUI7SUFLaEMsWUFBbUIsS0FBcUI7UUFBckIsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7UUFKeEMsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUNsQixjQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLFdBQU0sR0FBRyxJQUFJLENBQUM7SUFFNkIsQ0FBQztDQUM3QztBQU9ELE1BQU0sT0FBTyxxQkFBc0IsU0FBUSx3QkFBd0I7SUFDakUsWUFBbUIsS0FBYTtRQUM5QixLQUFLLEVBQUUsQ0FBQztRQURTLFVBQUssR0FBTCxLQUFLLENBQVE7SUFFaEMsQ0FBQztDQUNGO0FBRUQsTUFBTSxVQUFVLFNBQVMsQ0FDdkIsTUFBMEI7SUFFMUIsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQzFCLENBQUM7QUFFRCxNQUFNLFVBQVUsTUFBTSxDQUNwQixNQUE4QjtJQUU5QixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDdkIsQ0FBQztBQUVELE1BQU0sVUFBVSxTQUFTLENBQ3ZCLE1BQThCO0lBRTlCLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUMxQixDQUFDIn0=