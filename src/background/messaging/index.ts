/**
 * Messaging System for Background Service Worker
 *
 * This module handles message passing between different components of the extension:
 * - Popup <-> Background
 * - Content Scripts <-> Background
 * - Options Page <-> Background
 */

import eventEmitter from '../events';

// Message action types
export enum MessageAction {
  GET_PREFERENCES = 'getPreferences',
  SET_PREFERENCES = 'setPreferences',
  FETCH_DOCUMENT = 'fetchDocument',
  DOWNLOAD_DOCUMENT = 'downloadDocument',
  SCAN_PAGE = 'scanPage',
  UPDATE_STATUS = 'updateStatus',
}

// Message types
export interface Message {
  action: MessageAction | string;
  payload?: unknown;
}

// Response to a message
export interface MessageResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Message handler function type
export type MessageHandler = (
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: MessageResponse) => void
) => boolean | void;

// Collection of message handlers
const messageHandlers: Record<string, MessageHandler> = {};

/**
 * Initialize the messaging system
 */
export function initializeMessaging(): void {
  // Set up the message listener
  chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    console.log('Background received message:', message);

    // Process message
    return processMessage(message, sender, sendResponse);
  });

  // Listen for external messages (from other extensions or websites)
  chrome.runtime.onMessageExternal?.addListener((message: Message, sender, sendResponse) => {
    console.log('Background received external message:', message);

    // Process external message with additional security checks
    if (isAllowedExternalSender(sender)) {
      return processMessage(message, sender, sendResponse);
    }

    // Rejected due to security concerns
    sendResponse({
      success: false,
      error: 'External message rejected due to security policy',
    });
    return false;
  });
}

/**
 * Register a message handler for a specific action
 * @param action The action to handle
 * @param handler The handler function
 */
export function registerMessageHandler(action: string, handler: MessageHandler): void {
  messageHandlers[action] = handler;
}

/**
 * Process an incoming message
 * @param message The message to process
 * @param sender The sender information
 * @param sendResponse Function to send a response
 * @returns True if the response will be sent asynchronously
 */
function processMessage(
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: MessageResponse) => void
): boolean {
  // Check if we have a registered handler for this action
  if (messageHandlers[message.action]) {
    try {
      // Call the handler
      return messageHandlers[message.action](message, sender, sendResponse) || false;
    } catch (error) {
      console.error(`Error processing message ${message.action}:`, error);
      sendResponse({
        success: false,
        error: `Internal error processing message: ${error instanceof Error ? error.message : String(error)}`,
      });
      return false;
    }
  }

  // Emit event for this message action
  eventEmitter.emit(`message:${message.action}`, {
    message,
    sender,
    sendResponse,
  });

  // No specific handler, send default response
  sendResponse({
    success: false,
    error: `No handler registered for action: ${message.action}`,
  });

  return false;
}

/**
 * Check if an external message sender is allowed
 * @param sender The message sender
 * @returns True if the sender is allowed
 */
function isAllowedExternalSender(sender: chrome.runtime.MessageSender): boolean {
  // Implementation would depend on security requirements
  // For example, check against a whitelist of allowed origins
  const allowedOrigins = ['https://example.com'];
  return sender.origin ? allowedOrigins.includes(sender.origin) : false;
}

/**
 * Send a message to a specific tab
 * @param tabId The ID of the tab to send the message to
 * @param message The message to send
 * @returns Promise resolving to the response
 */
export function sendMessageToTab(tabId: number, message: Message): Promise<MessageResponse> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response: MessageResponse) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Send a message to all content scripts in active tabs
 * @param message The message to send
 * @returns Promise resolving to an array of responses
 */
export function broadcastToContentScripts(message: Message): Promise<MessageResponse[]> {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true }, tabs => {
      const responses: MessageResponse[] = [];
      let pendingResponses = tabs.length;

      if (pendingResponses === 0) {
        resolve(responses);
        return;
      }

      // Send message to each tab
      tabs.forEach(tab => {
        if (tab.id !== undefined) {
          sendMessageToTab(tab.id, message)
            .then(response => {
              responses.push(response);
            })
            .catch(error => {
              console.error(`Error sending message to tab ${tab.id}:`, error);
            })
            .finally(() => {
              pendingResponses--;
              if (pendingResponses === 0) {
                resolve(responses);
              }
            });
        } else {
          pendingResponses--;
        }
      });
    });
  });
}
