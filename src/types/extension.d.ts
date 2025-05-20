/**
 * Extension Types
 *
 * Type definitions specific to the Naval Auction Assistant extension.
 */

/**
 * User preferences stored in chrome.storage
 */
export interface UserPreferences {
  autoFill: boolean;
  notifyNewAuctions: boolean;
  filterKeywords?: string;
}

/**
 * Auction data structure
 */
export interface AuctionData {
  id: string;
  title: string;
  url: string;
  timestamp: string;
  description?: string;
  deadline?: string;
  budget?: string;
  relevanceScore?: number;
}

/**
 * Company profile data
 */
export interface CompanyProfile {
  name: string;
  capabilities: string[];
  preferences: {
    categories?: string[];
    regions?: string[];
    minimumBudget?: number;
  };
}

/**
 * Message structure for communication between extension components
 */
export interface ExtensionMessage {
  action: string;
  data?: unknown;
}
