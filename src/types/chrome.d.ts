// Type definitions for Chrome extension API
// This is extending the @types/chrome package

import { DropdownAnalysis } from '../content-scripts/dom-analyzer';

// Define message types for better type safety
export interface AnalyzeDropdownsMessage {
  action: 'analyzeDropdowns';
}

export interface AnalyzeDropdownsResponse {
  dropdowns?: DropdownAnalysis[];
}

// Define a generic message type for better type safety
export type ChromeMessage = AnalyzeDropdownsMessage;
export type ChromeResponse = AnalyzeDropdownsResponse | undefined;

// Properly extend Chrome namespace types
declare global {
  namespace chrome.tabs {
    export function sendMessage<T extends ChromeMessage, R extends ChromeResponse>(
      tabId: number,
      message: T,
      callback?: (response: R) => void
    ): void;
  }
}
