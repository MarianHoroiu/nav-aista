/**
 * Company Profile Service Interface
 * Defines the contract for services that manage company profiles
 */

import { CompanyProfile } from '../domain/CompanyProfile';

export interface CompanyProfileService {
  /**
   * Get a company profile by ID
   * @param id The company profile ID
   * @returns Promise resolving to the company profile or null if not found
   */
  getProfile(id: string): Promise<CompanyProfile | null>;

  /**
   * Get all company profiles
   * @returns Promise resolving to an array of company profiles
   */
  getAllProfiles(): Promise<CompanyProfile[]>;

  /**
   * Create a new company profile
   * @param profile The company profile to create
   * @returns Promise resolving to the created company profile
   */
  createProfile(
    profile: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CompanyProfile>;

  /**
   * Update an existing company profile
   * @param id The company profile ID
   * @param profile The partial company profile with updated fields
   * @returns Promise resolving to the updated company profile
   */
  updateProfile(id: string, profile: Partial<CompanyProfile>): Promise<CompanyProfile>;

  /**
   * Delete a company profile
   * @param id The company profile ID
   * @returns Promise resolving to true if the profile was deleted, false otherwise
   */
  deleteProfile(id: string): Promise<boolean>;
}
