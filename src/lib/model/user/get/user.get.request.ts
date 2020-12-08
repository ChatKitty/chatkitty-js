import { Channel } from '../../channel/channel.model';

export type GetUsersRequest = GetMembersRequest;

export declare class GetMembersRequest {
  channel: Channel;
}

export declare class GetUserRequest {
  id?: null;
  name?: string;
}

export function getUser(param: unknown): param is GetUserRequest {
  const request = param as GetUserRequest;

  return request.id !== undefined || request.name !== undefined;
}
