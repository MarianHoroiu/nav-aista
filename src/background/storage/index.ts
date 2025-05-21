/**
 * Storage Management for Background Service Worker
 *
 * This module provides utilities for managing extension storage:
 * - Get and set storage values
 * - Batch operations
 * - Storage change listeners
 */

import eventEmitter from '../events';

// Storage change event
export enum StorageEvent {
  CHANGED = 'storage:changed',
}

// Storage areas
export enum StorageArea {
  LOCAL = 'local',
  SYNC = 'sync',
  SESSION = 'session',
}

// Storage usage information
export interface StorageUsageInfo {
  bytesInUse: number;
}

/**
 * Initialize storage management
 */
export function initializeStorage(): void {
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log(`Storage changes in ${areaName}:`, changes);

    // Emit storage change event
    eventEmitter.emit(StorageEvent.CHANGED, {
      changes,
      area: areaName,
    });
  });
}

/**
 * Get a value from storage
 * @param key The key to get
 * @param area The storage area (default: local)
 * @returns Promise resolving to the value
 */
export async function getStorageItem<T>(
  key: string,
  area: StorageArea = StorageArea.LOCAL
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].get(key, result => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key] as T);
      }
    });
  });
}

/**
 * Get multiple values from storage
 * @param keys The keys to get
 * @param area The storage area (default: local)
 * @returns Promise resolving to the values
 */
export async function getStorageItems<T extends object>(
  keys: string[] | null,
  area: StorageArea = StorageArea.LOCAL
): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].get(keys, result => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result as T);
      }
    });
  });
}

/**
 * Set a value in storage
 * @param key The key to set
 * @param value The value to set
 * @param area The storage area (default: local)
 * @returns Promise resolving when the operation is complete
 */
export async function setStorageItem<T>(
  key: string,
  value: T,
  area: StorageArea = StorageArea.LOCAL
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Set multiple values in storage
 * @param items The items to set
 * @param area The storage area (default: local)
 * @returns Promise resolving when the operation is complete
 */
export async function setStorageItems<T extends object>(
  items: T,
  area: StorageArea = StorageArea.LOCAL
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].set(items, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Remove a value from storage
 * @param key The key to remove
 * @param area The storage area (default: local)
 * @returns Promise resolving when the operation is complete
 */
export async function removeStorageItem(
  key: string,
  area: StorageArea = StorageArea.LOCAL
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Remove multiple values from storage
 * @param keys The keys to remove
 * @param area The storage area (default: local)
 * @returns Promise resolving when the operation is complete
 */
export async function removeStorageItems(
  keys: string[],
  area: StorageArea = StorageArea.LOCAL
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Clear all values in a storage area
 * @param area The storage area (default: local)
 * @returns Promise resolving when the operation is complete
 */
export async function clearStorage(area: StorageArea = StorageArea.LOCAL): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].clear(() => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get storage usage information
 * @param area The storage area (default: local)
 * @returns Promise resolving to the storage usage information
 */
export async function getStorageUsage(
  area: StorageArea = StorageArea.LOCAL
): Promise<StorageUsageInfo> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].getBytesInUse(null, bytesInUse => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve({
          bytesInUse,
        });
      }
    });
  });
}
