/**
 * Content Script Messaging
 *
 * Handles messaging for content scripts, including communication with
 * the background service worker and the page scripts (if needed).
 */

import {
  contentMessageBus,
  MessageCategory,
  SystemAction,
  AuctionAction,
  DocumentAction,
  SystemEvent,
  MessageSource,
} from '../../shared/messaging';

/**
 * Initialize the content script messaging system
 */
export function initContentMessaging(): void {
  // Initialize the message bus
  contentMessageBus.init();

  // Set debug mode in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    contentMessageBus.setDebug(true);
  }

  // Register message handlers
  registerSystemHandlers();
  registerAuctionHandlers();
  registerDocumentHandlers();

  // Report initialization
  console.log('[Content] Messaging system initialized');

  // Check connection to background
  pingBackground()
    .then(result => {
      console.log('[Content] Connected to background service worker:', result);
    })
    .catch(error => {
      console.error('[Content] Failed to connect to background service worker:', error);
    });
}

/**
 * Register system message handlers for content script
 */
function registerSystemHandlers(): void {
  // Content script can respond to ping requests too
  contentMessageBus.registerHandler(MessageCategory.SYSTEM, SystemAction.PING, async () => {
    return {
      timestamp: Date.now(),
      source: MessageSource.CONTENT,
      url: window.location.href,
    };
  });

  // Listen for system events
  contentMessageBus.onEvent(SystemEvent.EXTENSION_DISABLED, () => {
    console.log('[Content] Extension was disabled');
  });

  contentMessageBus.onEvent(SystemEvent.DEBUG_MODE_CHANGED, data => {
    const { enabled } = data as { enabled: boolean };
    contentMessageBus.setDebug(enabled);
    console.log(`[Content] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  });
}

/**
 * Register auction-related message handlers
 */
function registerAuctionHandlers(): void {
  // Event listeners for auction-related events
  contentMessageBus.registerHandler(
    MessageCategory.AUCTION,
    AuctionAction.ANALYZE,
    async _message => {
      // Example implementation - would actually analyze the current auction page
      const auctionData = extractAuctionData();
      return auctionData;
    }
  );
}

/**
 * Register document-related message handlers
 */
function registerDocumentHandlers(): void {
  // Document-related message handling
  contentMessageBus.registerHandler(
    MessageCategory.DOCUMENT,
    DocumentAction.HIGHLIGHT,
    async message => {
      const { selector, color } = message.data as {
        selector: string;
        color: string;
      };

      const success = highlightElement(selector, color);
      return { success };
    }
  );
}

/**
 * Send a ping to the background service worker to check connection
 */
async function pingBackground(): Promise<{ timestamp: number }> {
  return contentMessageBus.sendRequest(MessageCategory.SYSTEM, SystemAction.PING, undefined, {
    timeout: 5000,
  });
}

/**
 * Extract auction data from the current page
 * (This is a placeholder implementation)
 */
function extractAuctionData(): Record<string, unknown> {
  // In a real implementation, this would extract auction data from the DOM
  return {
    title: document.title,
    url: window.location.href,
    timestamp: Date.now(),
  };
}

/**
 * Highlight an element on the page
 * (This is a placeholder implementation)
 */
function highlightElement(selector: string, color: string): boolean {
  try {
    const element = document.querySelector(selector);
    if (!element) {
      return false;
    }

    (element as HTMLElement).style.backgroundColor = color;
    (element as HTMLElement).style.outline = `2px solid ${color}`;
    return true;
  } catch (error) {
    console.error('[Content] Error highlighting element:', error);
    return false;
  }
}

// For development environments
declare const process: {
  env: {
    NODE_ENV: string;
  };
};

// Export the initialized message bus
export { contentMessageBus };
