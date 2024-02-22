export enum NativeEvent {
  STATUS_BAR_STATE_CHANGE = 'statusBarStateChange',
  STATUS_BAR_TEXT_CHANGE = 'statusBarTextChange',
  FULLSCREEN_CHANGE = 'fullscreenChange',
}

export enum StatusBarState {
  RUNNING = 'running',
  PAUSED = 'paused',
}

export interface SendNativeEventParams {
  name: NativeEvent;
  data: string;
}

export type AddNativeEventListenerParams =
  | AddNativeEventListenerParams_STATUS_BAR_STATE_CHANGE
  | AddNativeEventListenerParams_STATUS_BAR_TEXT_CHANGE
  | AddNativeEventListenerParams_FULLSCREEN_CHANGE;

export interface AddNativeEventListenerParams_STATUS_BAR_STATE_CHANGE {
  name: NativeEvent.STATUS_BAR_STATE_CHANGE;
  callback: (data: StatusBarState) => void;
}

export interface AddNativeEventListenerParams_STATUS_BAR_TEXT_CHANGE {
  name: NativeEvent.STATUS_BAR_TEXT_CHANGE;
  callback: (data: string) => void;
}

export interface AddNativeEventListenerParams_FULLSCREEN_CHANGE {
  name: NativeEvent.FULLSCREEN_CHANGE;
  callback: (data: 'true' | 'false') => void;
}

export interface RemoveNativeEventListenerParams {
  name: NativeEvent;
}