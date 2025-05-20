/**
 * Background Service Worker
 *
 * This is the main entry point for the extension's background script.
 * It handles events and orchestrates the extension's functionality.
 */

// Listen for installation event
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    console.log('Naval Auction Assistant installed');
    // Initialize extension storage with default values
    chrome.storage.local.set({
      initialized: true,
      preferences: {
        autoFill: true,
        notifyNewAuctions: true,
      },
    });
  }
});

// Example of a message listener for communication with content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'getPreferences') {
    chrome.storage.local.get('preferences', result => {
      sendResponse(result.preferences || {});
    });
    return true; // Required for async response
  }
  return false; // Required for TypeScript to know all paths return a value
});

// This keeps the service worker alive when needed
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20000);
chrome.runtime.onStartup.addListener(keepAlive);
