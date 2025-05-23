/// <reference types="chrome" />

// Define our own DropdownAnalysis to avoid import errors
export interface DropdownOption {
  value: string;
  text: string;
  selected: boolean;
}

export interface DropdownAnalysis {
  element?: HTMLSelectElement;
  title: string;
  id: string | null;
  name: string;
  options: DropdownOption[];
  isKendo?: boolean;
}

// Message interfaces for better type safety
export interface AnalyzeDropdownsMessage {
  action: 'analyzeDropdowns';
}

export interface AnalyzeDropdownsResponse {
  dropdowns?: DropdownAnalysis[];
}

// Add new interface for autocomplete inputs message
export interface AutocompleteInputsMessage {
  action: 'autocompleteInputs';
  startDate?: string; // Optional start date parameter (format: MM/DD/YYYY)
}

export interface AutocompleteInputsResponse {
  success: boolean;
  message?: string;
}

// Add interface for trigger search message
export interface TriggerSearchMessage {
  action: 'triggerSearch';
}

export interface TriggerSearchResponse {
  success: boolean;
  message?: string;
}

// Define a generic message type for better type safety
export type ChromeMessage =
  | AnalyzeDropdownsMessage
  | AutocompleteInputsMessage
  | TriggerSearchMessage;

export type ChromeResponse =
  | AnalyzeDropdownsResponse
  | AutocompleteInputsResponse
  | TriggerSearchResponse
  | undefined;

// Augment Chrome types to fix the sendMessage type error
declare namespace chrome.tabs {
  export function sendMessage<T extends ChromeMessage, U extends ChromeResponse>(
    tabId: number,
    message: T,
    callback?: (response: U) => void
  ): void;
}
