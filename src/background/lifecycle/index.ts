/**
 * Lifecycle Management for Background Service Worker
 *
 * This module handles the extension lifecycle events:
 * - Installation
 * - Update
 * - Uninstallation
 */

import eventEmitter from '../events';

// Extension lifecycle event types
export enum LifecycleEvent {
  INSTALLED = 'lifecycle:installed',
  UPDATED = 'lifecycle:updated',
  UNINSTALLED = 'lifecycle:uninstalled',
}

// Default storage values on installation
const DEFAULT_STORAGE = {
  preferences: {
    autoFill: true,
    notifyNewAuctions: true,
    downloadPath: 'downloads',
    theme: 'light',
  },
  history: [],
  lastSync: null,
  version: chrome.runtime.getManifest().version,
};

/**
 * Initialize lifecycle event handlers
 */
export function initializeLifecycle(): void {
  // Listen for installation and update events
  chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
      handleInstall();
    } else if (details.reason === 'update') {
      handleUpdate(details.previousVersion);
    }
  });

  // Keep the service worker alive
  setupKeepAlive();
}

/**
 * Handle extension installation
 */
function handleInstall(): void {
  console.log('Extension installed');

  // Initialize storage with default values
  chrome.storage.local.set(DEFAULT_STORAGE, () => {
    if (chrome.runtime.lastError) {
      console.error('Error initializing storage:', chrome.runtime.lastError);
    } else {
      console.log('Storage initialized with default values');
    }
  });

  // Emit installation event
  eventEmitter.emit(LifecycleEvent.INSTALLED);
}

/**
 * Handle extension update
 * @param previousVersion The previous version of the extension
 */
function handleUpdate(previousVersion?: string): void {
  const currentVersion = chrome.runtime.getManifest().version;
  console.log(`Extension updated from ${previousVersion} to ${currentVersion}`);

  // Update version in storage
  chrome.storage.local.get(['preferences'], result => {
    const storage = result || {};

    chrome.storage.local.set({
      ...storage,
      version: currentVersion,
    });
  });

  // Emit update event
  eventEmitter.emit(LifecycleEvent.UPDATED, {
    previousVersion,
    currentVersion,
  });
}

/**
 * Set up a keep-alive mechanism to prevent the service worker from being terminated
 */
function setupKeepAlive(): void {
  // This keeps the service worker active by pinging it periodically
  const keepAliveInterval = 20000; // 20 seconds

  // Use an interval to keep the worker alive when needed
  setInterval(() => {
    chrome.runtime.getPlatformInfo(() => {
      // This callback intentionally left empty
      // Just pinging to keep alive
    });
  }, keepAliveInterval);

  // Also register for startup events
  chrome.runtime.onStartup.addListener(() => {
    console.log('Browser started, initializing extension');
  });
}

/**
 * Request storage data clean-up (can be triggered manually)
 */
export function cleanupStorage(): void {
  console.log('Performing storage cleanup');

  // Example: Clean up old data or reset to defaults if needed
  chrome.storage.local.get(null, items => {
    // Keep essential data, clean up temporary data
    const keysToKeep = ['preferences', 'version'];
    const cleanStorage: Record<string, unknown> = {};

    keysToKeep.forEach(key => {
      if (items[key]) {
        cleanStorage[key] = items[key];
      }
    });

    chrome.storage.local.clear(() => {
      chrome.storage.local.set(cleanStorage);
    });
  });
}
