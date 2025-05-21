/**
 * Background Service Worker
 *
 * This is the main entry point for the extension's background script.
 * It initializes all background services and handles extension lifecycle.
 */

// Import modules
import { DownloadFile, initializeDownloads, downloadFile } from './downloads';
import eventEmitter from './events';
import { initializeLifecycle } from './lifecycle';
import { initializeMessaging, registerMessageHandler, MessageAction } from './messaging';
import { initializeStorage, getStorageItem, setStorageItem } from './storage';

console.log('Naval Auction Assistant background service worker starting...');

/**
 * Initialize background service worker
 */
async function initializeBackgroundService(): Promise<void> {
  try {
    // Initialize all services in order
    initializeStorage();
    initializeLifecycle();
    initializeMessaging();
    initializeDownloads();

    // Register global error handler
    registerGlobalErrorHandler();

    // Register message handlers
    registerMessageHandlers();

    console.log('Background service worker initialized successfully');
  } catch (error) {
    console.error('Failed to initialize background service worker:', error);
  }
}

/**
 * Register a global error handler for unhandled errors
 */
function registerGlobalErrorHandler(): void {
  self.addEventListener('error', event => {
    console.error('Unhandled error in background service worker:', event.error);
  });

  self.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection in background service worker:', event.reason);
  });
}

/**
 * Register message handlers for different message types
 */
function registerMessageHandlers(): void {
  // Get preferences
  registerMessageHandler(MessageAction.GET_PREFERENCES, (_message, _sender, sendResponse) => {
    getStorageItem('preferences')
      .then(preferences => {
        sendResponse({
          success: true,
          data: preferences || {},
        });
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: `Failed to get preferences: ${error}`,
        });
      });

    return true; // Async response
  });

  // Set preferences
  registerMessageHandler(MessageAction.SET_PREFERENCES, (message, _sender, sendResponse) => {
    if (!message.payload || typeof message.payload !== 'object') {
      sendResponse({
        success: false,
        error: 'Invalid preferences data',
      });
      return false;
    }

    setStorageItem('preferences', message.payload)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: `Failed to save preferences: ${error}`,
        });
      });

    return true; // Async response
  });

  // Download document
  registerMessageHandler(MessageAction.DOWNLOAD_DOCUMENT, (message, _sender, sendResponse) => {
    if (!message.payload || typeof message.payload !== 'object') {
      sendResponse({
        success: false,
        error: 'Invalid download data',
      });
      return false;
    }

    downloadFile(message.payload as DownloadFile)
      .then(downloadId => {
        sendResponse({
          success: true,
          data: { downloadId },
        });
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: `Failed to download document: ${error}`,
        });
      });

    return true; // Async response
  });

  // Example of handling custom events from content scripts
  eventEmitter.on('contentScript:ready', (data: { tabId: number }) => {
    console.log('Content script ready on tab:', data.tabId);
  });
}

// Start initialization
initializeBackgroundService().catch(error => {
  console.error('Background service worker initialization failed:', error);
});
