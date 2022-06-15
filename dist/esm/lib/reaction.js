import { ChatKittySucceededResult } from './result';
export class ReactedToMessageResult extends ChatKittySucceededResult {
    constructor(reaction) {
        super();
        this.reaction = reaction;
    }
}
export class GetReactionsSucceededResult extends ChatKittySucceededResult {
    constructor(paginator) {
        super();
        this.paginator = paginator;
    }
}
export class RemovedReactionResult extends ChatKittySucceededResult {
    constructor(reaction) {
        super();
        this.reaction = reaction;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3JlYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFHTCx3QkFBd0IsRUFDekIsTUFBTSxVQUFVLENBQUM7QUE4QmxCLE1BQU0sT0FBTyxzQkFBdUIsU0FBUSx3QkFBd0I7SUFDbEUsWUFBbUIsUUFBa0I7UUFDbkMsS0FBSyxFQUFFLENBQUM7UUFEUyxhQUFRLEdBQVIsUUFBUSxDQUFVO0lBRXJDLENBQUM7Q0FDRjtBQVdELE1BQU0sT0FBTywyQkFBNEIsU0FBUSx3QkFBd0I7SUFDdkUsWUFBbUIsU0FBdUM7UUFDeEQsS0FBSyxFQUFFLENBQUM7UUFEUyxjQUFTLEdBQVQsU0FBUyxDQUE4QjtJQUUxRCxDQUFDO0NBQ0Y7QUFZRCxNQUFNLE9BQU8scUJBQXNCLFNBQVEsd0JBQXdCO0lBQ2pFLFlBQW1CLFFBQWtCO1FBQ25DLEtBQUssRUFBRSxDQUFDO1FBRFMsYUFBUSxHQUFSLFFBQVEsQ0FBVTtJQUVyQyxDQUFDO0NBQ0YifQ==