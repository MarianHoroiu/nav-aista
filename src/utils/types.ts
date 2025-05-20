/**
 * Defines the structure for a company profile
 */
export interface CompanyProfile {
  companyName: string;
  location: {
    country: string;
    city: string;
  };
  capabilities: {
    shipTypes: string[];
    tonnageRange: {
      min: number;
      max: number;
    };
    repairSpecializations: string[];
    certifications: string[];
  };
  preferences: {
    preferredLocations: string[];
    maximumDistance: number;
    keywords: string[];
  };
}

/**
 * Type definition for auction search criteria
 */
export type SearchCriteria = {
  keywords: string[];
  locations: string[];
  shipTypes?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
};

/**
 * Utility function type for scoring relevance
 */
export type RelevanceScorer = (profile: CompanyProfile, criteria: SearchCriteria) => number;
