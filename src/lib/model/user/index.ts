export interface UserProperties {
  id: number;
  name: string;
  displayName: string;
  displayPictureUrl: string;
  isGuest: string;
  properties: unknown;
}

export declare class User implements UserProperties {
  displayName: string;
  displayPictureUrl: string;
  id: number;
  isGuest: string;
  name: string;
  properties: unknown;
}
