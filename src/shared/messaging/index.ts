/**
 * Messaging System
 *
 * Core messaging utilities for communication between different components
 * of the extension (background service worker, content scripts, popup UI).
 */

import { v4 as uuidv4 } from 'uuid';

import {
  MessagingError,
  TimeoutError,
  ConnectionError,
  HandlerNotFoundError,
  ErrorCode,
} from './errors';
import { EventCallback, EventType, eventEmitter } from './events';
import {
  MessageSource,
  MessageType,
  MessageCategory,
  MessageAction,
  RequestMessage,
  ResponseMessage,
  ErrorMessage,
  EventMessage,
  Message,
  MessageHandler,
  TIMEOUT,
} from './types';

/**
 * Interface for storing pending requests
 */
interface PendingRequest {
  resolve: (data: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Message bus for handling extension communication
 */
export class MessageBus {
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private source: MessageSource;
  private initialized = false;
  private debug = false;

  constructor(source: MessageSource) {
    this.source = source;
  }

  /**
   * Initialize the message bus
   */
  init(): void {
    if (this.initialized) {
      return;
    }

    this.setupMessageListener();
    this.initialized = true;
    this.log('MessageBus initialized');
  }

  /**
   * Enable or disable debug logging
   */
  setDebug(enabled: boolean): void {
    this.debug = enabled;
  }

  /**
   * Register a message handler for a specific category and action
   */
  registerHandler<T = unknown, R = unknown>(
    category: MessageCategory,
    action: MessageAction,
    handler: MessageHandler<T, R>
  ): void {
    const key = this.getHandlerKey(category, action);
    this.messageHandlers.set(key, handler as MessageHandler);
    this.log(`Registered handler for ${key}`);
  }

  /**
   * Unregister a message handler
   */
  unregisterHandler(category: MessageCategory, action: MessageAction): void {
    const key = this.getHandlerKey(category, action);
    this.messageHandlers.delete(key);
    this.log(`Unregistered handler for ${key}`);
  }

  /**
   * Send a request message and wait for response
   */
  async sendRequest<T = unknown, R = unknown>(
    category: MessageCategory,
    action: MessageAction,
    data?: T,
    options: {
      tabId?: number;
      frameId?: number;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<R> {
    const { tabId, timeout = TIMEOUT.DEFAULT, retries = 0 } = options;

    // Create request message
    const message: RequestMessage<T> = {
      id: uuidv4(),
      source: this.source,
      type: MessageType.REQUEST,
      timestamp: Date.now(),
      category,
      action,
      data,
      tabId,
      timeout,
    };

    try {
      const result = await this.sendMessage(message, { timeout, retries });
      return result as R;
    } catch (error) {
      if (error instanceof TimeoutError && retries > 0) {
        this.log(`Request timed out, retrying (${retries} attempts left)`);
        return this.sendRequest(category, action, data, {
          ...options,
          retries: retries - 1,
        });
      }
      throw error;
    }
  }

  /**
   * Send an event message (fire and forget)
   */
  sendEvent<T = unknown>(
    category: MessageCategory,
    action: MessageAction,
    event: EventType,
    data?: T,
    options: {
      tabId?: number;
      frameId?: number;
    } = {}
  ): void {
    const { tabId, frameId } = options;

    const message: EventMessage<T> = {
      id: uuidv4(),
      source: this.source,
      type: MessageType.EVENT,
      timestamp: Date.now(),
      category,
      action,
      event,
      data,
    };

    this.sendMessageWithoutResponse(message, { tabId, frameId }).catch(error => {
      this.log(
        `Error sending event: ${error instanceof Error ? error.message : String(error)}`,
        true
      );
    });
  }

  /**
   * Subscribe to an event
   */
  onEvent<T = unknown>(event: EventType, callback: EventCallback<T>): () => void {
    return eventEmitter.on(event, callback);
  }

  /**
   * Setup message listener based on the current context
   */
  private setupMessageListener(): void {
    if (this.source === MessageSource.BACKGROUND) {
      // Background script listens to messages from content scripts and popup
      chrome.runtime.onMessage.addListener(this.handleChromeMessage);
    } else if (this.source === MessageSource.CONTENT) {
      // Content script listens to messages from background and handle forwarding to page
      chrome.runtime.onMessage.addListener(this.handleChromeMessage);
      window.addEventListener('message', this.handleWindowMessage);
    } else if (this.source === MessageSource.POPUP) {
      // Popup listens to messages from background
      chrome.runtime.onMessage.addListener(this.handleChromeMessage);
    }
  }

  /**
   * Handle incoming Chrome messages
   */
  private handleChromeMessage = (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ): boolean => {
    if (!this.isValidMessage(message)) {
      return false;
    }

    this.log(
      `Received chrome message: ${JSON.stringify({
        id: message.id,
        type: message.type,
        category: message.category,
        action: message.action,
      })}`
    );

    this.processMessage(message, sender)
      .then(response => {
        if (message.type === MessageType.REQUEST) {
          sendResponse(response);
        }
      })
      .catch(error => {
        if (message.type === MessageType.REQUEST) {
          const errorMessage: ErrorMessage = {
            id: uuidv4(),
            source: this.source,
            type: MessageType.ERROR,
            timestamp: Date.now(),
            category: message.category,
            action: message.action,
            requestId: message.id,
            error:
              error instanceof MessagingError
                ? error.toObject()
                : {
                    code: 'UNKNOWN_ERROR',
                    message: String(error),
                    details: error,
                  },
          };
          sendResponse(errorMessage);
        }
      });

    // Return true to indicate we will send a response asynchronously
    return true;
  };

  /**
   * Handle incoming window messages (for content scripts)
   */
  private handleWindowMessage = (event: MessageEvent): void => {
    // Only process messages from the same window
    if (event.source !== window) {
      return;
    }

    const { data } = event;
    if (!data || data.target !== 'naval-auction-assistant') {
      return;
    }

    const message = data.message;
    if (!this.isValidMessage(message)) {
      return;
    }

    this.log(
      `Received window message: ${JSON.stringify({
        id: message.id,
        type: message.type,
        category: message.category,
        action: message.action,
      })}`
    );

    this.processMessage(message, { url: window.location.href })
      .then(response => {
        if (message.type === MessageType.REQUEST) {
          window.postMessage(
            {
              target: 'naval-auction-assistant-page',
              message: response,
            },
            '*'
          );
        }
      })
      .catch(error => {
        if (message.type === MessageType.REQUEST) {
          const errorMessage: ErrorMessage = {
            id: uuidv4(),
            source: this.source,
            type: MessageType.ERROR,
            timestamp: Date.now(),
            category: message.category,
            action: message.action,
            requestId: message.id,
            error:
              error instanceof MessagingError
                ? error.toObject()
                : {
                    code: 'UNKNOWN_ERROR',
                    message: String(error),
                    details: error,
                  },
          };
          window.postMessage(
            {
              target: 'naval-auction-assistant-page',
              message: errorMessage,
            },
            '*'
          );
        }
      });
  };

  /**
   * Process an incoming message
   */
  private async processMessage(
    message: Message,
    sender: chrome.runtime.MessageSender | { url: string }
  ): Promise<Message | undefined> {
    try {
      switch (message.type) {
        case MessageType.REQUEST:
          return await this.handleRequest(message, sender);
        case MessageType.RESPONSE:
          this.handleResponse(message);
          return;
        case MessageType.ERROR:
          this.handleError(message);
          return;
        case MessageType.EVENT:
          this.handleEvent(message);
          return;
        default:
          return;
      }
    } catch (error) {
      this.log(
        `Error processing message: ${error instanceof Error ? error.message : String(error)}`,
        true
      );
      throw error;
    }
  }

  /**
   * Handle a request message
   */
  private async handleRequest(
    message: RequestMessage,
    sender: chrome.runtime.MessageSender | { url: string }
  ): Promise<ResponseMessage> {
    const { category, action, id } = message;
    const handlerKey = this.getHandlerKey(category, action);
    const handler = this.messageHandlers.get(handlerKey);

    if (!handler) {
      throw new HandlerNotFoundError(handlerKey);
    }

    try {
      const result = await handler(message, sender as chrome.runtime.MessageSender);

      return {
        id: uuidv4(),
        source: this.source,
        type: MessageType.RESPONSE,
        timestamp: Date.now(),
        category: message.category,
        action: message.action,
        requestId: id,
        data: result,
      };
    } catch (error) {
      throw MessagingError.from(error);
    }
  }

  /**
   * Handle a response message
   */
  private handleResponse(message: ResponseMessage): void {
    const { requestId, data } = message;
    const pendingRequest = this.pendingRequests.get(requestId);

    if (pendingRequest) {
      clearTimeout(pendingRequest.timer);
      pendingRequest.resolve(data);
      this.pendingRequests.delete(requestId);
    }
  }

  /**
   * Handle an error message
   */
  private handleError(message: ErrorMessage): void {
    const { requestId, error } = message;
    const pendingRequest = this.pendingRequests.get(requestId);

    if (pendingRequest) {
      clearTimeout(pendingRequest.timer);
      const messagingError = new MessagingError(
        error.code as ErrorCode,
        error.message,
        error.details
      );
      pendingRequest.reject(messagingError);
      this.pendingRequests.delete(requestId);
    }
  }

  /**
   * Handle an event message
   */
  private handleEvent(message: EventMessage): void {
    const { event, data } = message;
    eventEmitter.emit(event as EventType, data);
  }

  /**
   * Send a message and wait for a response
   */
  private sendMessage<T = unknown>(
    message: RequestMessage<T>,
    options: { timeout: number; retries?: number }
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const { timeout } = options;

      // Create a timer for the request
      const timer = setTimeout(() => {
        this.pendingRequests.delete(message.id);
        reject(
          new TimeoutError(`Request timed out after ${timeout}ms`, {
            messageId: message.id,
            category: message.category,
            action: message.action,
          })
        );
      }, timeout);

      // Store the pending request
      this.pendingRequests.set(message.id, { resolve, reject, timer });

      // Send the message based on the current context and target
      this.sendMessageWithoutResponse(message, { tabId: message.tabId }).catch(error => {
        this.pendingRequests.delete(message.id);
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  /**
   * Send a message without expecting a response
   */
  private async sendMessageWithoutResponse(
    message: Message,
    options: { tabId?: number; frameId?: number } = {}
  ): Promise<void> {
    const { tabId, frameId } = options;

    this.log(
      `Sending message: ${JSON.stringify({
        id: message.id,
        type: message.type,
        category: message.category,
        action: message.action,
        tabId,
        frameId,
      })}`
    );

    try {
      if (this.source === MessageSource.BACKGROUND) {
        if (tabId !== undefined) {
          // Send from background to specific tab
          await chrome.tabs.sendMessage(tabId, message, { frameId });
        } else {
          // Broadcast from background to all tabs
          const tabs = await chrome.tabs.query({});
          for (const tab of tabs) {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, message, { frameId }).catch(() => {
                // Ignore errors if tab isn't ready
              });
            }
          }
        }
      } else if (this.source === MessageSource.CONTENT) {
        if (message.source === MessageSource.CONTENT && tabId === undefined) {
          // Send from content script to page script
          window.postMessage(
            {
              target: 'naval-auction-assistant-page',
              message,
            },
            '*'
          );
        } else {
          // Send from content script to background
          await chrome.runtime.sendMessage(message);
        }
      } else if (this.source === MessageSource.POPUP) {
        // Send from popup to background
        await chrome.runtime.sendMessage(message);
      }
    } catch (error) {
      this.log(
        `Error sending message: ${error instanceof Error ? error.message : String(error)}`,
        true
      );
      throw new ConnectionError(
        `Failed to send message: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if a message is valid
   */
  private isValidMessage(message: unknown): message is Message {
    return (
      message !== null &&
      typeof message === 'object' &&
      message !== null &&
      'id' in message &&
      'source' in message &&
      'type' in message &&
      'timestamp' in message &&
      'category' in message &&
      'action' in message
    );
  }

  /**
   * Get a unique key for message handler lookup
   */
  private getHandlerKey(category: MessageCategory, action: MessageAction): string {
    return `${category}:${action}`;
  }

  /**
   * Log a message if debug is enabled
   */
  private log(message: string, isError = false): void {
    if (this.debug) {
      const logFn = isError ? console.error : console.log;
      logFn(`[MessageBus:${this.source}] ${message}`);
    }
  }
}

// Export message bus instances for different contexts
export const backgroundMessageBus = new MessageBus(MessageSource.BACKGROUND);
export const contentMessageBus = new MessageBus(MessageSource.CONTENT);
export const popupMessageBus = new MessageBus(MessageSource.POPUP);

/**
 * Initializes the background messaging system
 * This is provided for compatibility with existing code
 */
export function initBackgroundMessaging(): void {
  backgroundMessageBus.init();
}

// Re-export types and utilities
export * from './types';
export * from './errors';
export * from './events';
