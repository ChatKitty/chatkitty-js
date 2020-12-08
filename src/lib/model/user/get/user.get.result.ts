import { ChatKittyPaginator } from '../../../chatkitty.paginator';
import { ChatKittySucceededResult } from '../../../chatkitty.result';
import { User } from '../user.model';


export class GetUsersResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<User>) {
    super();
  }
}

export class GetUserResult extends ChatKittySucceededResult {
  constructor(public user: User) {
    super();
  }
}

