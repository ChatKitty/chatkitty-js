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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1zZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi91c2VyLXNlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUN6QyxPQUFPLEVBR0wsd0JBQXdCLEVBQ3pCLE1BQU0sVUFBVSxDQUFDO0FBZWxCLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSx3QkFBd0I7SUFDaEUsWUFBbUIsT0FBb0I7UUFDckMsS0FBSyxFQUFFLENBQUM7UUFEUyxZQUFPLEdBQVAsT0FBTyxDQUFhO0lBRXZDLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxjQUFjO0lBQ3BEO1FBQ0UsS0FBSyxDQUNILG9CQUFvQixFQUNwQixrR0FBa0csQ0FDbkcsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxjQUFjO0lBQ3REO1FBQ0UsS0FBSyxDQUFDLHNCQUFzQixFQUFFLG9DQUFvQyxDQUFDLENBQUM7SUFDdEUsQ0FBQztDQUNGIn0=