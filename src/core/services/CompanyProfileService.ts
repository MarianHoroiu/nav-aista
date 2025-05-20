/**
 * Company Profile Service
 * Core service implementation for managing company profiles
 */

import { StorageService } from '../../infrastructure/api/StorageService';
import { CompanyProfile, CompanyProfileEntity } from '../domain/CompanyProfile';
import { CompanyProfileService as ICompanyProfileService } from '../interfaces/CompanyProfileService';

export class CompanyProfileService implements ICompanyProfileService {
  private readonly storageService: StorageService;

  constructor(storageService: StorageService) {
    this.storageService = storageService;
  }

  /**
   * Get a company profile by ID
   * @param id The company profile ID
   * @returns Promise resolving to the company profile or null if not found
   */
  async getProfile(id: string): Promise<CompanyProfile | null> {
    try {
      const profileData = await this.storageService.get<CompanyProfile>(`profile:${id}`);
      return profileData ? new CompanyProfileEntity(profileData) : null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  /**
   * Get all company profiles
   * @returns Promise resolving to an array of company profiles
   */
  async getAllProfiles(): Promise<CompanyProfile[]> {
    try {
      const profilesData = await this.storageService.getAll<CompanyProfile>('profile:');
      return profilesData.map((profile: CompanyProfile) => new CompanyProfileEntity(profile));
    } catch (error) {
      console.error('Error fetching all profiles:', error);
      return [];
    }
  }

  /**
   * Create a new company profile
   * @param profile The company profile to create
   * @returns Promise resolving to the created company profile
   */
  async createProfile(
    profile: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CompanyProfile> {
    const id = this.generateId();
    const now = new Date();

    const newProfile: CompanyProfile = {
      ...profile,
      id,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.storageService.set(`profile:${id}`, newProfile);
      return new CompanyProfileEntity(newProfile);
    } catch (error) {
      console.error('Error creating profile:', error);
      throw new Error('Failed to create company profile');
    }
  }

  /**
   * Update an existing company profile
   * @param id The company profile ID
   * @param profile The partial company profile with updated fields
   * @returns Promise resolving to the updated company profile
   */
  async updateProfile(id: string, profile: Partial<CompanyProfile>): Promise<CompanyProfile> {
    const existingProfile = await this.getProfile(id);

    if (!existingProfile) {
      throw new Error(`Profile with ID ${id} not found`);
    }

    const profileEntity = new CompanyProfileEntity(existingProfile);
    profileEntity.update(profile);

    try {
      await this.storageService.set(`profile:${id}`, profileEntity);
      return profileEntity;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update company profile');
    }
  }

  /**
   * Delete a company profile
   * @param id The company profile ID
   * @returns Promise resolving to true if the profile was deleted, false otherwise
   */
  async deleteProfile(id: string): Promise<boolean> {
    try {
      await this.storageService.remove(`profile:${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  }

  /**
   * Generate a unique ID for a new company profile
   * @returns A unique ID string
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
