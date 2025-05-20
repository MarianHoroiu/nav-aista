/**
 * Global ambient declarations
 *
 * This file contains global type declarations to fix TypeScript errors
 * for missing type definition files for 'api' and 'domain'.
 */

// Declare empty modules for 'api' and 'domain' to prevent TypeScript errors
declare module 'api' {
  // Add specific types here if needed
}

declare module 'domain' {
  // Add specific types here if needed
}

// Make chrome APIs available globally without having to import
interface Window {
  chrome: typeof chrome;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Ensure chrome namespace is available globally
declare namespace chrome {
  export namespace storage {
    export interface StorageArea {
      // Callback-based methods
      get(
        keys: string | string[] | object | null,
        callback: (items: { [key: string]: any }) => void
      ): void;
      set(items: object, callback?: () => void): void;
      remove(keys: string | string[], callback?: () => void): void;
      clear(callback?: () => void): void;

      // Promise-based methods (these aren't part of the standard API but our code uses them)
      get(keys: string | string[] | object | null): Promise<{ [key: string]: any }>;
      set(items: object): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
      clear(): Promise<void>;
    }

    export const sync: StorageArea;
    export const local: StorageArea;
    export const managed: StorageArea;
    export const session: StorageArea; // Added session storage
  }

  export namespace runtime {
    export function getURL(path: string): string;
    export function getManifest(): any;
    export function sendMessage(message: any, responseCallback?: (response: any) => void): void;
    export function sendMessage(
      extensionId: string,
      message: any,
      responseCallback?: (response: any) => void
    ): void;
    export const onMessage: {
      addListener(
        callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void
      ): void;
      removeListener(
        callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void
      ): void;
    };
    export const onInstalled: {
      addListener(callback: (details: any) => void): void;
    };
    export const onStartup: {
      addListener(callback: () => void): void;
    };
    export function getPlatformInfo(callback?: (platformInfo: any) => void): void;
    export function openOptionsPage(callback?: () => void): void;
  }

  export namespace tabs {
    export function query(queryInfo: object, callback: (result: any[]) => void): void;
    export function create(createProperties: object, callback?: (tab: any) => void): void;
    export function update(
      tabId: number,
      updateProperties: object,
      callback?: (tab?: any) => void
    ): void;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
