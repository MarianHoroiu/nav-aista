/**
 * Chrome Storage Service
 * Implementation of the StorageService interface using Chrome Storage API
 */

import { StorageService } from '../api/StorageService';

export class ChromeStorageService implements StorageService {
  private storage: chrome.storage.StorageArea;

  constructor(storageType: 'sync' | 'local' | 'session' = 'local') {
    this.storage = chrome.storage[storageType];
  }

  /**
   * Get a value from Chrome storage by key
   * @param key The storage key
   * @returns Promise resolving to the value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.storage.get(key);
      return key in result ? (result[key] as T) : null;
    } catch (error) {
      console.error(`ChromeStorageService: Error getting ${key}`, error);
      return null;
    }
  }

  /**
   * Get multiple values from Chrome storage by key prefix
   * @param keyPrefix The storage key prefix
   * @returns Promise resolving to an array of values
   */
  async getAll<T>(keyPrefix: string): Promise<T[]> {
    try {
      const allItems = await this.storage.get(null);
      return Object.entries(allItems)
        .filter(([key]) => key.startsWith(keyPrefix))
        .map(([, value]) => value as T);
    } catch (error) {
      console.error(`ChromeStorageService: Error getting items with prefix ${keyPrefix}`, error);
      return [];
    }
  }

  /**
   * Set a value in Chrome storage
   * @param key The storage key
   * @param value The value to store
   * @returns Promise resolving when the operation is complete
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await this.storage.set({ [key]: value });
    } catch (error) {
      console.error(`ChromeStorageService: Error setting ${key}`, error);
      throw error;
    }
  }

  /**
   * Remove a value from Chrome storage
   * @param key The storage key
   * @returns Promise resolving when the operation is complete
   */
  async remove(key: string): Promise<void> {
    try {
      await this.storage.remove(key);
    } catch (error) {
      console.error(`ChromeStorageService: Error removing ${key}`, error);
      throw error;
    }
  }

  /**
   * Clear all stored values from Chrome storage
   * @returns Promise resolving when the operation is complete
   */
  async clear(): Promise<void> {
    try {
      await this.storage.clear();
    } catch (error) {
      console.error('ChromeStorageService: Error clearing storage', error);
      throw error;
    }
  }
}
