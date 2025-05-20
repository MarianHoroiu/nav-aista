/// <reference types="chrome" />

import { DropdownAnalysis } from '../content-scripts/dom-analyzer';

// Message interfaces for better type safety
export interface AnalyzeDropdownsMessage {
  action: 'analyzeDropdowns';
}

export interface AnalyzeDropdownsResponse {
  dropdowns?: DropdownAnalysis[];
}

// Define a generic message type for better type safety
export type ChromeMessage = AnalyzeDropdownsMessage;
export type ChromeResponse = AnalyzeDropdownsResponse | undefined;

// Augment Chrome types to fix the sendMessage type error
declare namespace chrome.tabs {
  export function sendMessage<T extends ChromeMessage, U extends ChromeResponse>(
    tabId: number,
    message: T,
    callback?: (response: U) => void
  ): void;
}
