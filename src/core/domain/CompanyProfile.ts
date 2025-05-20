/**
 * Company Profile Domain Entity
 * Represents the core data structure for a company profile in the Naval Auction Assistant
 */

export interface Location {
  country: string;
  city: string;
}

export interface Capabilities {
  shipTypes: string[];
  tonnageRange: {
    min: number;
    max: number;
  };
  repairSpecializations: string[];
  certifications: string[];
}

export interface Preferences {
  preferredLocations: string[];
  maximumDistance: number;
  keywords: string[];
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  location: Location;
  capabilities: Capabilities;
  preferences: Preferences;
  createdAt: Date;
  updatedAt: Date;
}

export class CompanyProfileEntity implements CompanyProfile {
  id: string;
  companyName: string;
  location: Location;
  capabilities: Capabilities;
  preferences: Preferences;
  createdAt: Date;
  updatedAt: Date;

  constructor(profile: CompanyProfile) {
    this.id = profile.id;
    this.companyName = profile.companyName;
    this.location = { ...profile.location };
    this.capabilities = {
      ...profile.capabilities,
      shipTypes: [...profile.capabilities.shipTypes],
      repairSpecializations: [...profile.capabilities.repairSpecializations],
      certifications: [...profile.capabilities.certifications],
    };
    this.preferences = {
      ...profile.preferences,
      preferredLocations: [...profile.preferences.preferredLocations],
      keywords: [...profile.preferences.keywords],
    };
    this.createdAt = new Date(profile.createdAt);
    this.updatedAt = new Date(profile.updatedAt);
  }

  public update(partialProfile: Partial<CompanyProfile>): void {
    // Implement update logic with proper validation
    if (partialProfile.companyName) {
      this.companyName = partialProfile.companyName;
    }

    // Update other fields as needed

    this.updatedAt = new Date();
  }
}
