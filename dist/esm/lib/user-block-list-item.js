import { ChatKittySucceededResult } from './result';
export class GetUserBlockListSucceededResult extends ChatKittySucceededResult {
    constructor(paginator) {
        super();
        this.paginator = paginator;
    }
}
export class DeleteUserBlockListItemSucceededResult extends ChatKittySucceededResult {
    constructor(user) {
        super();
        this.user = user;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ibG9jay1saXN0LWl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3VzZXItYmxvY2stbGlzdC1pdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFHTCx3QkFBd0IsRUFDekIsTUFBTSxVQUFVLENBQUM7QUFrQmxCLE1BQU0sT0FBTywrQkFBZ0MsU0FBUSx3QkFBd0I7SUFDM0UsWUFBbUIsU0FBZ0Q7UUFDakUsS0FBSyxFQUFFLENBQUM7UUFEUyxjQUFTLEdBQVQsU0FBUyxDQUF1QztJQUVuRSxDQUFDO0NBQ0Y7QUFXRCxNQUFNLE9BQU8sc0NBQXVDLFNBQVEsd0JBQXdCO0lBQ2xGLFlBQW1CLElBQVU7UUFDM0IsS0FBSyxFQUFFLENBQUM7UUFEUyxTQUFJLEdBQUosSUFBSSxDQUFNO0lBRTdCLENBQUM7Q0FDRiJ9