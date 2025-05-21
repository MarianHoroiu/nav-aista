/**
 * Background Service Worker
 *
 * This is the main entry point for the extension's background script.
 * It initializes all background services and handles extension lifecycle.
 */

// Import modules
import {
  backgroundMessageBus,
  MessageCategory,
  SettingsAction,
  DocumentAction,
  RequestMessage,
  initBackgroundMessaging,
} from '../shared/messaging';

import { DownloadFile, initializeDownloads, downloadFile } from './downloads';
import eventEmitter from './events';
import { initializeLifecycle } from './lifecycle';
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
    initBackgroundMessaging();
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
  backgroundMessageBus.registerHandler(MessageCategory.SETTINGS, SettingsAction.GET, async () => {
    try {
      const preferences = await getStorageItem('preferences');
      return {
        success: true,
        data: preferences || {},
      };
    } catch (error) {
      throw new Error(`Failed to get preferences: ${error}`);
    }
  });

  // Set preferences
  backgroundMessageBus.registerHandler(
    MessageCategory.SETTINGS,
    SettingsAction.SET,
    async (message: RequestMessage) => {
      if (!message.data || typeof message.data !== 'object') {
        throw new Error('Invalid preferences data');
      }

      await setStorageItem('preferences', message.data);
      return { success: true };
    }
  );

  // Download document
  backgroundMessageBus.registerHandler(
    MessageCategory.DOCUMENT,
    DocumentAction.FETCH,
    async (message: RequestMessage) => {
      if (!message.data || typeof message.data !== 'object') {
        throw new Error('Invalid download data');
      }

      const downloadId = await downloadFile(message.data as DownloadFile);
      return {
        success: true,
        data: { downloadId },
      };
    }
  );

  // Example of handling custom events from content scripts
  eventEmitter.on('contentScript:ready', (data: { tabId: number }) => {
    console.log('Content script ready on tab:', data.tabId);
  });
}

// Start initialization
initializeBackgroundService().catch(error => {
  console.error('Background service worker initialization failed:', error);
});
