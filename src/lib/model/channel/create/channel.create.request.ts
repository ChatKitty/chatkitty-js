import { ChatkittyResourceReference } from '../../../chatkitty.resource-reference';

export declare class CreateChannelRequest {
  type: string;
  name?: string;
  members?: ChatkittyResourceReference[];
  properties?: unknown;
}
