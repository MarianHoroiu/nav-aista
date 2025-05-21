/**
 * Events System for Background Service Worker
 *
 * This module implements a simple event emitter pattern for the background service worker.
 * It allows different components of the extension to communicate through a pub/sub pattern.
 */

type EventHandler<T = unknown> = (data: T) => void;

interface EventMap {
  [key: string]: EventHandler[];
}

/**
 * Event emitter for the background service worker
 */
class EventEmitter {
  private events: EventMap = {};

  /**
   * Subscribe to an event
   * @param event The event name
   * @param handler The event handler function
   */
  on<T = unknown>(event: string, handler: EventHandler<T>): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler as EventHandler);
  }

  /**
   * Subscribe to an event and remove after first execution
   * @param event The event name
   * @param handler The event handler function
   */
  once<T = unknown>(event: string, handler: EventHandler<T>): void {
    const onceHandler: EventHandler<T> = (data: T) => {
      this.off(event, onceHandler);
      handler(data);
    };
    this.on(event, onceHandler);
  }

  /**
   * Unsubscribe from an event
   * @param event The event name
   * @param handler The event handler function to remove
   */
  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(h => h !== handler);
  }

  /**
   * Emit an event with data
   * @param event The event name
   * @param data The data to pass to handlers
   */
  emit<T = unknown>(event: string, data?: T): void {
    if (!this.events[event]) return;
    this.events[event].forEach(handler => {
      try {
        handler(data as unknown);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Remove all handlers for an event
   * @param event The event name
   */
  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Create a singleton instance
const eventEmitter = new EventEmitter();

export default eventEmitter;
