/**
 * Type definitions for browser extension APIs
 * These supplement the standard Chrome types from @types/chrome
 */

// Extend Window interface for messaging between content scripts and page
interface Window {
  navAista?: {
    ready: boolean;
    version: string;
  };
}

// Custom event types for extension messaging
interface NavAistaEvent extends CustomEvent {
  detail: {
    type: string;
    payload: unknown;
  };
}
