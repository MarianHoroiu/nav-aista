// This file is for testing ESLint rules
import { CompanyProfile } from './types';

// Should trigger no-console warning (but allowed with --fix)
console.warn('This should be allowed');

// Should not trigger unused var error due to underscore prefix
export function testFunction(_unusedParam: string): CompanyProfile {
  // Return a profile
  const profile: CompanyProfile = {
    companyName: 'Test Company',
    location: {
      country: 'Test Country',
      city: 'Test City',
    },
    capabilities: {
      shipTypes: ['Type1', 'Type2'],
      tonnageRange: {
        min: 100,
        max: 1000,
      },
      repairSpecializations: ['Spec1', 'Spec2'],
      certifications: ['Cert1', 'Cert2'],
    },
    preferences: {
      preferredLocations: ['Loc1', 'Loc2'],
      maximumDistance: 100,
      keywords: ['Key1', 'Key2'],
    },
  };

  return profile;
}
