import { ChatKittyError } from './error';
import { ChatKittySucceededResult } from './result';
export class StartedSessionResult extends ChatKittySucceededResult {
    constructor(session) {
        super();
        this.session = session;
    }
}
export class SessionActiveError extends ChatKittyError {
    constructor() {
        super('SessionActiveError', 'A user session is already active and must be ended before this instance can start a new session.');
    }
}
export class NoActiveSessionError extends ChatKittyError {
    constructor() {
        super('NoActiveSessionError', "You're not connected to ChatKitty.");
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1zZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi91c2VyLXNlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUN6QyxPQUFPLEVBR0wsd0JBQXdCLEVBQ3pCLE1BQU0sVUFBVSxDQUFDO0FBZ0JsQixNQUFNLE9BQU8sb0JBQXFCLFNBQVEsd0JBQXdCO0lBQ2hFLFlBQW1CLE9BQW9CO1FBQ3JDLEtBQUssRUFBRSxDQUFDO1FBRFMsWUFBTyxHQUFQLE9BQU8sQ0FBYTtJQUV2QyxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsY0FBYztJQUNwRDtRQUNFLEtBQUssQ0FDSCxvQkFBb0IsRUFDcEIsa0dBQWtHLENBQ25HLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sb0JBQXFCLFNBQVEsY0FBYztJQUN0RDtRQUNFLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7Q0FDRiJ9