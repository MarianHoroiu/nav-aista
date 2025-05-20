/**
 * Storage Utilities
 *
 * Helper functions for working with Chrome Extension storage API.
 */

import { UserPreferences, CompanyProfile, AuctionData } from '@/types/extension';

/**
 * Get user preferences from storage
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  return new Promise(resolve => {
    chrome.storage.local.get('preferences', result => {
      resolve(
        result.preferences || {
          autoFill: true,
          notifyNewAuctions: true,
        }
      );
    });
  });
}

/**
 * Save user preferences to storage
 */
export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.local.set({ preferences }, () => {
      resolve();
    });
  });
}

/**
 * Get saved auctions from storage
 */
export async function getSavedAuctions(): Promise<AuctionData[]> {
  return new Promise(resolve => {
    chrome.storage.local.get('savedAuctions', result => {
      resolve(result.savedAuctions || []);
    });
  });
}

/**
 * Save auction to storage
 */
export async function saveAuction(auction: AuctionData): Promise<void> {
  const savedAuctions = await getSavedAuctions();
  const exists = savedAuctions.some(item => item.id === auction.id);

  if (!exists) {
    savedAuctions.push(auction);
    return new Promise(resolve => {
      chrome.storage.local.set({ savedAuctions }, () => {
        resolve();
      });
    });
  }

  return Promise.resolve();
}

/**
 * Get company profile from storage
 */
export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  return new Promise(resolve => {
    chrome.storage.local.get('companyProfile', result => {
      resolve(result.companyProfile || null);
    });
  });
}

/**
 * Save company profile to storage
 */
export async function saveCompanyProfile(profile: CompanyProfile): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.local.set({ companyProfile: profile }, () => {
      resolve();
    });
  });
}
