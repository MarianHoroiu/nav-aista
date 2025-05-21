/**
 * Messaging Types
 *
 * This file contains TypeScript interfaces and types for the messaging system
 * that enables communication between different components of the extension:
 * - Background service worker
 * - Content scripts
 * - Popup UI
 */

/**
 * Message source identifiers
 */
export enum MessageSource {
  BACKGROUND = 'background',
  CONTENT = 'content',
  POPUP = 'popup',
}

/**
 * Message type identifiers
 */
export enum MessageType {
  // Request-response pattern messages
  REQUEST = 'request',
  RESPONSE = 'response',
  ERROR = 'error',

  // Event-based messages
  EVENT = 'event',

  // System messages
  PING = 'ping',
  PONG = 'pong',
  INIT = 'init',
  SHUTDOWN = 'shutdown',
}

/**
 * Message categories for organizing different message actions
 */
export enum MessageCategory {
  SYSTEM = 'system',
  AUCTION = 'auction',
  DOCUMENT = 'document',
  SETTINGS = 'settings',
  UI = 'ui',
  AUTH = 'auth',
  NOTIFICATION = 'notification',
}

/**
 * Message actions for each category
 */
export enum SystemAction {
  PING = 'ping',
  INIT = 'init',
  GET_STATUS = 'getStatus',
  SET_DEBUG = 'setDebug',
  LOG = 'log',
}

export enum AuctionAction {
  FETCH_LIST = 'fetchList',
  FETCH_DETAILS = 'fetchDetails',
  ANALYZE = 'analyze',
  MONITOR = 'monitor',
  STOP_MONITORING = 'stopMonitoring',
  NOTIFY = 'notify',
}

export enum DocumentAction {
  FETCH = 'fetch',
  ANALYZE = 'analyze',
  HIGHLIGHT = 'highlight',
  EXTRACT_DATA = 'extractData',
  CONVERT = 'convert',
}

export enum SettingsAction {
  GET = 'get',
  SET = 'set',
  RESET = 'reset',
  SYNC = 'sync',
}

export enum UIAction {
  OPEN_POPUP = 'openPopup',
  CLOSE_POPUP = 'closePopup',
  SHOW_NOTIFICATION = 'showNotification',
  UPDATE_BADGE = 'updateBadge',
}

export enum AuthAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CHECK_STATUS = 'checkStatus',
  REFRESH_TOKEN = 'refreshToken',
}

export enum NotificationAction {
  SHOW = 'show',
  DISMISS = 'dismiss',
  CLICK = 'click',
}

/**
 * Union type of all possible actions
 */
export type MessageAction =
  | SystemAction
  | AuctionAction
  | DocumentAction
  | SettingsAction
  | UIAction
  | AuthAction
  | NotificationAction;

/**
 * Base message interface that all messages extend
 */
export interface BaseMessage {
  id: string;
  source: MessageSource;
  type: MessageType;
  timestamp: number;
  category: MessageCategory;
  action: MessageAction;
}

/**
 * Request message interface
 */
export interface RequestMessage<T = unknown> extends BaseMessage {
  type: MessageType.REQUEST;
  data?: T;
  tabId?: number;
  timeout?: number;
}

/**
 * Response message interface
 */
export interface ResponseMessage<T = unknown> extends BaseMessage {
  type: MessageType.RESPONSE;
  requestId: string;
  data: T;
}

/**
 * Error message interface
 */
export interface ErrorMessage extends BaseMessage {
  type: MessageType.ERROR;
  requestId: string;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Event message interface
 */
export interface EventMessage<T = unknown> extends BaseMessage {
  type: MessageType.EVENT;
  event: string;
  data?: T;
}

/**
 * Union type for all message types
 */
export type Message = RequestMessage | ResponseMessage | ErrorMessage | EventMessage;

/**
 * Message handler function type
 */
export type MessageHandler<T = unknown, R = unknown> = (
  message: RequestMessage<T>,
  sender?: chrome.runtime.MessageSender
) => Promise<R> | R;

/**
 * Event listener function type
 */
export type EventListener<T = unknown> = (data: T, sender?: chrome.runtime.MessageSender) => void;

/**
 * Message response timeouts (in milliseconds)
 */
export const TIMEOUT = {
  DEFAULT: 5000,
  SHORT: 1000,
  LONG: 15000,
};
