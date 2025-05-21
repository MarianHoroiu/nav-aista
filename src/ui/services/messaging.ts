/**
 * UI Messaging Service
 *
 * Provides messaging functionality for the UI components, allowing them to
 * communicate with the background service worker and content scripts.
 */

import {
  popupMessageBus,
  MessageCategory,
  SystemAction,
  AuctionAction,
  DocumentAction,
  SettingsAction,
  UIAction,
  AuthAction,
  SystemEvent,
  AuctionEvent,
  EventType,
  EventCallback,
  MessageSource,
} from '../../shared/messaging';

/**
 * Class that provides messaging functionality for UI components
 */
export class MessagingService {
  private initialized = false;

  /**
   * Initialize the messaging service
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    // Initialize the message bus
    popupMessageBus.init();

    // Set debug mode in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      popupMessageBus.setDebug(true);
    }

    // Set up basic handlers
    this.setupSystemHandlers();

    this.initialized = true;
    console.log('[UI] Messaging service initialized');

    // Ping background to verify connection
    this.pingBackground()
      .then(result => {
        console.log('[UI] Connected to background service worker:', result);
      })
      .catch(error => {
        console.error('[UI] Failed to connect to background service worker:', error);
      });
  }

  /**
   * Set up system message handlers
   */
  private setupSystemHandlers(): void {
    // Basic ping handler
    popupMessageBus.registerHandler(MessageCategory.SYSTEM, SystemAction.PING, async () => {
      return {
        timestamp: Date.now(),
        source: MessageSource.POPUP,
      };
    });
  }

  /**
   * Ping the background service worker to verify connection
   */
  async pingBackground(): Promise<{ timestamp: number; source: string }> {
    return popupMessageBus.sendRequest(MessageCategory.SYSTEM, SystemAction.PING);
  }

  /**
   * Get extension status information
   */
  async getExtensionStatus(): Promise<{
    isEnabled: boolean;
    version: string;
    timestamp: number;
  }> {
    return popupMessageBus.sendRequest(MessageCategory.SYSTEM, SystemAction.GET_STATUS);
  }

  /**
   * Get user settings
   */
  async getSettings(): Promise<{
    theme: string;
    notifications: boolean;
    autoRefresh: boolean;
    [key: string]: unknown;
  }> {
    return popupMessageBus.sendRequest(MessageCategory.SETTINGS, SettingsAction.GET);
  }

  /**
   * Update user settings
   */
  async updateSettings(settings: Record<string, unknown>): Promise<{ success: boolean }> {
    return popupMessageBus.sendRequest(MessageCategory.SETTINGS, SettingsAction.SET, settings);
  }

  /**
   * Fetch auction list
   */
  async fetchAuctions(): Promise<{ auctions: unknown[]; timestamp: number }> {
    return popupMessageBus.sendRequest(MessageCategory.AUCTION, AuctionAction.FETCH_LIST);
  }

  /**
   * Fetch auction details
   */
  async fetchAuctionDetails(auctionId: string): Promise<unknown> {
    return popupMessageBus.sendRequest(MessageCategory.AUCTION, AuctionAction.FETCH_DETAILS, {
      auctionId,
    });
  }

  /**
   * Analyze the current auction page
   * @param tabId Optional tab ID to target a specific tab
   */
  async analyzeAuction(tabId?: number): Promise<unknown> {
    return popupMessageBus.sendRequest(MessageCategory.AUCTION, AuctionAction.ANALYZE, undefined, {
      tabId,
    });
  }

  /**
   * Fetch a document
   */
  async fetchDocument(documentId: string): Promise<unknown> {
    return popupMessageBus.sendRequest(MessageCategory.DOCUMENT, DocumentAction.FETCH, {
      documentId,
    });
  }

  /**
   * Highlight elements in a document
   * @param tabId The tab ID to target
   * @param selector The CSS selector to target elements
   * @param color The highlight color
   */
  async highlightElements(
    tabId: number,
    selector: string,
    color = '#FFFF00'
  ): Promise<{ success: boolean }> {
    return popupMessageBus.sendRequest(
      MessageCategory.DOCUMENT,
      DocumentAction.HIGHLIGHT,
      { selector, color },
      { tabId }
    );
  }

  /**
   * Check authentication status
   */
  async checkAuthStatus(): Promise<{
    isLoggedIn: boolean;
    username: string | null;
  }> {
    return popupMessageBus.sendRequest(MessageCategory.AUTH, AuthAction.CHECK_STATUS);
  }

  /**
   * Update badge on the extension icon
   */
  async updateBadge(text: string, backgroundColor?: string): Promise<{ success: boolean }> {
    return popupMessageBus.sendRequest(MessageCategory.UI, UIAction.UPDATE_BADGE, {
      text,
      backgroundColor,
    });
  }

  /**
   * Subscribe to an event
   */
  onEvent<T = unknown>(event: EventType, callback: EventCallback<T>): () => void {
    return popupMessageBus.onEvent(event, callback);
  }

  /**
   * Subscribe to auction events
   */
  onAuctionEvent<T = unknown>(event: AuctionEvent, callback: EventCallback<T>): () => void {
    return this.onEvent(event, callback);
  }

  /**
   * Subscribe to system events
   */
  onSystemEvent<T = unknown>(event: SystemEvent, callback: EventCallback<T>): () => void {
    return this.onEvent(event, callback);
  }
}

// For development environments
declare const process: {
  env: {
    NODE_ENV: string;
  };
};

// Create and export singleton instance
export const messagingService = new MessagingService();
