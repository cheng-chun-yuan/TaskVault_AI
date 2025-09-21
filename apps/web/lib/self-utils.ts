/**
 * Utility functions for Self Protocol v2
 * These replace functions that were previously exported from @selfxyz/core v1
 */

import { keccak256, encodePacked } from 'viem';

/**
 * Self v2 disclosure configuration interface
 */
export interface SelfDisclosures {
  minimumAge: number;
  excludedCountries: string[];
  ofac: boolean;
  name?: boolean;
  nationality?: boolean;
  date_of_birth?: boolean;
  [key: string]: unknown;
}

/**
 * Hash endpoint with scope for Self verification
 * Replacement for hashEndpointWithScope from v1
 */
export function hashEndpointWithScope(endpoint: string, scope: string): bigint {
  const combined = `${endpoint}_${scope}`;
  const hash = keccak256(encodePacked(['string'], [combined]));
  return BigInt(hash);
}

/**
 * Pack forbidden countries into the format expected by Self contracts
 * Replacement for getPackedForbiddenCountries from v1
 */
export function getPackedForbiddenCountries(countries: string[]): string[] {
  // This implementation may need adjustment based on Self v2 contract requirements
  // In v1, this typically packed country codes into byte arrays
  
  const packed: string[] = [];
  
  // Pack countries into groups of 4 (assuming 3-letter country codes)
  for (let i = 0; i < countries.length; i += 4) {
    const group = countries.slice(i, i + 4);
    
    // Pad the group to 4 countries if needed
    while (group.length < 4) {
      group.push('');
    }
    
    // Encode as bytes32
    const groupString = group.join('').padEnd(32, '\0');
    const bytes32 = '0x' + Buffer.from(groupString, 'utf8')
      .toString('hex')
      .padEnd(64, '0');
    
    packed.push(bytes32);
  }
  
  // Ensure we have exactly 4 packed strings (contract requirement)
  while (packed.length < 4) {
    packed.push('0x' + '0'.repeat(64));
  }
  
  return packed.slice(0, 4);
}

/**
 * Convert country codes to their numeric representations if needed
 */
export function countryCodeToNumber(countryCode: string): number {
  // This is a simplified mapping - in production you'd want a complete mapping
  const codeMap: { [key: string]: number } = {
    'IRN': 364,  // Iran
    'PRK': 408,  // North Korea
    'RUS': 643,  // Russia
    'SYR': 760,  // Syria
    'VEN': 862,  // Venezuela
    // Add more country codes as needed
  };
  
  return codeMap[countryCode] || 0;
}

/**
 * Validate Self v2 disclosure configuration
 */
export function validateDisclosures(disclosures: SelfDisclosures): boolean {
  const requiredFields = ['minimumAge', 'excludedCountries', 'ofac'];
  const v2Fields = ['name', 'nationality', 'date_of_birth'];
  
  // Check that required fields are present
  for (const field of requiredFields) {
    if (!(field in disclosures)) {
      console.warn(`Missing required disclosure field: ${field}`);
      return false;
    }
  }
  
  // Validate v2 fields are boolean when present
  for (const field of v2Fields) {
    if (field in disclosures && typeof disclosures[field] !== 'boolean') {
      console.warn(`Invalid type for disclosure field ${field}: expected boolean`);
      return false;
    }
  }
  
  return true;
}