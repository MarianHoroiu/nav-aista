/**
 * Storage Service Interface
 * Defines the contract for storage-related services in the extension
 */

export interface StorageService {
  /**
   * Get a value from storage by key
   * @param key The storage key
   * @returns Promise resolving to the value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Get multiple values from storage by key prefix
   * @param keyPrefix The storage key prefix
   * @returns Promise resolving to an array of values
   */
  getAll<T>(keyPrefix: string): Promise<T[]>;

  /**
   * Set a value in storage
   * @param key The storage key
   * @param value The value to store
   * @returns Promise resolving when the operation is complete
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Remove a value from storage
   * @param key The storage key
   * @returns Promise resolving when the operation is complete
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all stored values
   * @returns Promise resolving when the operation is complete
   */
  clear(): Promise<void>;
}
