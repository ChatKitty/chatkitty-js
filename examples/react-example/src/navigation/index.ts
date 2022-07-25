export type View = 'Menu' | 'Chat' | 'Join Channel';

export interface LayoutState {
  menu: boolean;
  chat: boolean;
  joinChannel: boolean;
}
