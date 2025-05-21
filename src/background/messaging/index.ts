/**
 * Background Service Worker Messaging
 *
 * Handles messaging for the background service worker, including setting up message handlers,
 * forwarding messages between components, and handling system events.
 */

import {
  backgroundMessageBus,
  MessageCategory,
  SystemAction,
  AuctionAction,
  DocumentAction,
  SettingsAction,
  UIAction,
  AuthAction,
  SystemEvent,
  eventEmitter,
  MessageSource,
} from '../../shared/messaging';
import { ErrorCode, MessagingError } from '../../shared/messaging/errors';

/**
 * Initialize the background messaging system
 */
export function initBackgroundMessaging(): void {
  // Initialize the message bus
  backgroundMessageBus.init();

  // Set debug mode in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    backgroundMessageBus.setDebug(true);
  }

  // Register system message handlers
  registerSystemHandlers();

  // Register feature-specific handlers
  registerAuctionHandlers();
  registerDocumentHandlers();
  registerSettingsHandlers();
  registerUIHandlers();
  registerAuthHandlers();

  // Report initialization
  console.log('[Background] Messaging system initialized');
  eventEmitter.emit(SystemEvent.EXTENSION_ENABLED, { timestamp: Date.now() });
}

/**
 * Register system message handlers
 */
function registerSystemHandlers(): void {
  // Ping handler for connection testing
  backgroundMessageBus.registerHandler(MessageCategory.SYSTEM, SystemAction.PING, async () => {
    return { timestamp: Date.now(), source: MessageSource.BACKGROUND };
  });

  // Get extension status
  backgroundMessageBus.registerHandler(
    MessageCategory.SYSTEM,
    SystemAction.GET_STATUS,
    async () => {
      return {
        isEnabled: true,
        version: chrome.runtime.getManifest().version,
        timestamp: Date.now(),
      };
    }
  );

  // Set debug mode
  backgroundMessageBus.registerHandler(
    MessageCategory.SYSTEM,
    SystemAction.SET_DEBUG,
    async message => {
      const data = (message.data as { enabled: boolean }) || { enabled: false };
      const enabled = data.enabled;
      backgroundMessageBus.setDebug(enabled);

      // Notify about debug mode change
      eventEmitter.emit(SystemEvent.DEBUG_MODE_CHANGED, { enabled });

      return { success: true, debugEnabled: enabled };
    }
  );

  // Log message
  backgroundMessageBus.registerHandler(MessageCategory.SYSTEM, SystemAction.LOG, async message => {
    const { level = 'info', content } = message.data as { level?: string; content: string };

    switch (level) {
      case 'error':
        console.error(`[Log] ${content}`);
        break;
      case 'warn':
        console.warn(`[Log] ${content}`);
        break;
      case 'debug':
        console.debug(`[Log] ${content}`);
        break;
      case 'info':
      default:
        console.log(`[Log] ${content}`);
        break;
    }

    return { success: true };
  });
}

/**
 * Register auction-related message handlers
 */
function registerAuctionHandlers(): void {
  // Fetch auction list handler
  backgroundMessageBus.registerHandler(
    MessageCategory.AUCTION,
    AuctionAction.FETCH_LIST,
    async () => {
      // This is a placeholder - actual implementation would fetch auctions
      // from the e-licitatie.ro website or API
      return {
        auctions: [],
        timestamp: Date.now(),
      };
    }
  );

  // Other auction handlers would be registered here
}

/**
 * Register document-related message handlers
 */
function registerDocumentHandlers(): void {
  // Document fetch handler
  backgroundMessageBus.registerHandler(
    MessageCategory.DOCUMENT,
    DocumentAction.FETCH,
    async message => {
      // This is a placeholder - actual implementation would fetch document data
      // from the e-licitatie.ro website or API
      const data = (message.data as { documentId?: string }) || {};
      throw new MessagingError(ErrorCode.ACTION_FAILED, 'Document fetch is not implemented yet', {
        documentId: data.documentId,
      });
    }
  );

  // Other document handlers would be registered here
}

/**
 * Register settings-related message handlers
 */
function registerSettingsHandlers(): void {
  // Get settings handler
  backgroundMessageBus.registerHandler(MessageCategory.SETTINGS, SettingsAction.GET, async () => {
    // This is a placeholder - actual implementation would get settings from storage
    return {
      theme: 'light',
      notifications: true,
      autoRefresh: false,
    };
  });

  // Other settings handlers would be registered here
}

/**
 * Register UI-related message handlers
 */
function registerUIHandlers(): void {
  // Update badge handler
  backgroundMessageBus.registerHandler(MessageCategory.UI, UIAction.UPDATE_BADGE, async message => {
    const { text, backgroundColor } = message.data as {
      text: string;
      backgroundColor?: string;
    };

    await chrome.action.setBadgeText({ text });

    if (backgroundColor) {
      await chrome.action.setBadgeBackgroundColor({ color: backgroundColor });
    }

    return { success: true };
  });

  // Other UI handlers would be registered here
}

/**
 * Register authentication-related message handlers
 */
function registerAuthHandlers(): void {
  // Check auth status handler
  backgroundMessageBus.registerHandler(MessageCategory.AUTH, AuthAction.CHECK_STATUS, async () => {
    // This is a placeholder - actual implementation would check auth status
    return {
      isLoggedIn: false,
      username: null,
    };
  });

  // Other auth handlers would be registered here
}

// For development environments
declare const process: {
  env: {
    NODE_ENV: string;
  };
};

// Export the initialized message bus
export { backgroundMessageBus };
