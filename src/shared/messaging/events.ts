/**
 * Messaging Event System
 *
 * This file contains the event system implementation for the messaging system,
 * allowing components to subscribe to and publish events.
 */

/**
 * Event categories
 */
export enum EventCategory {
  SYSTEM = 'system',
  AUCTION = 'auction',
  DOCUMENT = 'document',
  SETTINGS = 'settings',
  UI = 'ui',
  AUTH = 'auth',
  NOTIFICATION = 'notification',
}

/**
 * System events
 */
export enum SystemEvent {
  EXTENSION_INSTALLED = 'extension.installed',
  EXTENSION_UPDATED = 'extension.updated',
  EXTENSION_ENABLED = 'extension.enabled',
  EXTENSION_DISABLED = 'extension.disabled',
  CONNECTION_STATE = 'connection.state',
  DEBUG_MODE_CHANGED = 'debug.modeChanged',
}

/**
 * Auction events
 */
export enum AuctionEvent {
  LIST_UPDATED = 'auction.listUpdated',
  DETAILS_UPDATED = 'auction.detailsUpdated',
  NEW_AUCTION = 'auction.new',
  AUCTION_CLOSING_SOON = 'auction.closingSoon',
  AUCTION_CLOSED = 'auction.closed',
  AUCTION_CHANGED = 'auction.changed',
  MONITORING_STARTED = 'auction.monitoringStarted',
  MONITORING_STOPPED = 'auction.monitoringStopped',
}

/**
 * Document events
 */
export enum DocumentEvent {
  LOADED = 'document.loaded',
  PROCESSING_STARTED = 'document.processingStarted',
  PROCESSING_COMPLETED = 'document.processingCompleted',
  PROCESSING_FAILED = 'document.processingFailed',
  HIGHLIGHT_ADDED = 'document.highlightAdded',
  HIGHLIGHT_REMOVED = 'document.highlightRemoved',
  DATA_EXTRACTED = 'document.dataExtracted',
}

/**
 * Settings events
 */
export enum SettingsEvent {
  UPDATED = 'settings.updated',
  RESET = 'settings.reset',
  SYNCED = 'settings.synced',
}

/**
 * UI events
 */
export enum UIEvent {
  POPUP_OPENED = 'ui.popupOpened',
  POPUP_CLOSED = 'ui.popupClosed',
  TAB_ACTIVATED = 'ui.tabActivated',
  THEME_CHANGED = 'ui.themeChanged',
}

/**
 * Auth events
 */
export enum AuthEvent {
  LOGGED_IN = 'auth.loggedIn',
  LOGGED_OUT = 'auth.loggedOut',
  SESSION_EXPIRED = 'auth.sessionExpired',
  TOKEN_REFRESHED = 'auth.tokenRefreshed',
}

/**
 * Notification events
 */
export enum NotificationEvent {
  SHOWN = 'notification.shown',
  DISMISSED = 'notification.dismissed',
  CLICKED = 'notification.clicked',
}

/**
 * Union type of all event types
 */
export type EventType =
  | SystemEvent
  | AuctionEvent
  | DocumentEvent
  | SettingsEvent
  | UIEvent
  | AuthEvent
  | NotificationEvent;

/**
 * Event handler callback type
 */
export type EventCallback<T = unknown> = (data: T) => void;

/**
 * Simple event emitter implementation
 */
export class EventEmitter {
  private subscriptions: Map<EventType, Set<EventCallback<unknown>>> = new Map();

  /**
   * Subscribe to an event
   */
  on<T = unknown>(event: EventType, callback: EventCallback<T>): () => void {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set());
    }

    this.subscriptions.get(event)!.add(callback as EventCallback<unknown>);

    // Return unsubscribe function
    return () => this.off(event, callback as EventCallback<unknown>);
  }

  /**
   * Subscribe to an event for a single occurrence
   */
  once<T = unknown>(event: EventType, callback: EventCallback<T>): () => void {
    const onceCallback: EventCallback<unknown> = (data: unknown) => {
      this.off(event, onceCallback);
      (callback as EventCallback<unknown>)(data);
    };

    return this.on<unknown>(event, onceCallback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: EventType, callback: EventCallback<unknown>): void {
    const callbacks = this.subscriptions.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscriptions.delete(event);
      }
    }
  }

  /**
   * Emit an event with data
   */
  emit<T = unknown>(event: EventType, data?: T): void {
    const callbacks = this.subscriptions.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data as unknown);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    this.subscriptions.clear();
  }
}

// Create a global event emitter instance
export const eventEmitter = new EventEmitter();
