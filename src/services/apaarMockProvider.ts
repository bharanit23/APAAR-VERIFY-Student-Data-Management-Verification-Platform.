/**
 * APAAR / Academic Bank of Credits (ABC) / DigiLocker Mock Verification Adapter
 * 
 * IMPORTANT: This is an authorized prototype simulation engine with seeded synthetic identities.
 * It strictly adheres to government mock adapter protocols and does not connect to live production APIs.
 */

import { ApaarVerificationStatus } from '../types';

export interface MockRegistryRecord {
  apaarId: string;
  legalName: string;
  dob: string; // YYYY-MM-DD
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  aadhaarLinked: boolean;
  abcAccountId: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

// Seeded synthetic mock identities for deterministic regulatory testing
export const SYNTHETIC_APAAR_REGISTRY: Record<string, MockRegistryRecord> = {
  // 1. Valid APAAR Student (Aryan Sharma)
  '712345678901': {
    apaarId: '712345678901',
    legalName: 'Aryan Sharma',
    dob: '2004-05-14',
    gender: 'MALE',
    aadhaarLinked: true,
    abcAccountId: 'ABC-DL-2024-8841',
    status: 'ACTIVE',
  },
  // 2. Name Mismatch Student (Priya Ranganathan)
  '823456789012': {
    apaarId: '823456789012',
    legalName: 'Priya Ranganathan',
    dob: '2003-11-20',
    gender: 'FEMALE',
    aadhaarLinked: true,
    abcAccountId: 'ABC-TN-2023-9102',
    status: 'ACTIVE',
  },
  // 3. Cross-Institution Duplicate Student (Neha Verma)
  '634567890123': {
    apaarId: '634567890123',
    legalName: 'Neha Verma',
    dob: '2004-08-09',
    gender: 'FEMALE',
    aadhaarLinked: true,
    abcAccountId: 'ABC-DL-2024-3321',
    status: 'ACTIVE',
  },
  // 4. DOB Mismatch Student (Rahul Dev)
  '545678901234': {
    apaarId: '545678901234',
    legalName: 'Rahul Dev',
    dob: '2004-01-12', // Notice: Registry has 12th Jan, college entered 10th Jan
    gender: 'MALE',
    aadhaarLinked: true,
    abcAccountId: 'ABC-MH-2024-4412',
    status: 'ACTIVE',
  },
  // 5. Valid Student (Ananya Deshmukh)
  '456789012345': {
    apaarId: '456789012345',
    legalName: 'Ananya Deshmukh',
    dob: '2004-03-25',
    gender: 'FEMALE',
    aadhaarLinked: true,
    abcAccountId: 'ABC-MH-2024-5561',
    status: 'ACTIVE',
  },
  // 6. Valid Student (Karthik Raja)
  '367890123456': {
    apaarId: '367890123456',
    legalName: 'Karthik Raja',
    dob: '2003-09-18',
    gender: 'MALE',
    aadhaarLinked: true,
    abcAccountId: 'ABC-TN-2023-6672',
    status: 'ACTIVE',
  },
  // 7. Valid Student (Sneha Hegde)
  '278901234567': {
    apaarId: '278901234567',
    legalName: 'Sneha Hegde',
    dob: '2004-12-04',
    gender: 'FEMALE',
    aadhaarLinked: true,
    abcAccountId: 'ABC-KA-2024-7783',
    status: 'ACTIVE',
  },
  // 8. Valid Student (Tanya Paul)
  '189012345678': {
    apaarId: '189012345678',
    legalName: 'Tanya Paul',
    dob: '2004-07-22',
    gender: 'FEMALE',
    aadhaarLinked: true,
    abcAccountId: 'ABC-KA-2024-8894',
    status: 'ACTIVE',
  },
};

export interface ApaarVerificationResult {
  status: ApaarVerificationStatus;
  isSimulated: boolean;
  apaarId: string;
  registryName?: string;
  registryDob?: string;
  nameMatchScore: number; // 0 to 100
  dobMatched: boolean;
  failureReason?: string;
  abcAccountId?: string;
  timestamp: string;
}

// Calculate fuzzy name similarity (Levenshtein-based ratio)
function calculateNameSimilarity(name1: string, name2: string): number {
  const n1 = name1.toLowerCase().trim().replace(/[^a-z]/g, '');
  const n2 = name2.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (n1 === n2) return 100;
  if (!n1 || !n2) return 0;
  if (n1.includes(n2) || n2.includes(n1)) return 85;

  const m = n1.length;
  const n = n2.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = n1[i - 1] === n2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }

  const distance = d[m][n];
  const maxLen = Math.max(m, n);
  return Math.round(((maxLen - distance) / maxLen) * 100);
}

/**
 * Validates APAAR 12-digit format according to national specification
 */
export function validateApaarFormat(apaarId: string): { valid: boolean; reason?: string } {
  const clean = apaarId ? apaarId.replace(/\s+/g, '').trim() : '';
  if (!clean) {
    return { valid: false, reason: 'APAAR ID is missing or empty' };
  }
  if (!/^\d{12}$/.test(clean)) {
    return { valid: false, reason: 'APAAR ID must contain exactly 12 numeric digits without alphabets or special characters' };
  }
  // Check for repeated trivial sequences e.g. 000000000000 or 111111111111
  if (/^(\d)\1{11}$/.test(clean)) {
    return { valid: false, reason: 'Repeated sequential digits are not permitted in national APAAR registry' };
  }
  return { valid: true };
}

/**
 * Validates APAAR identity with the mock ABC / DigiLocker adapter
 */
export async function verifyWithApaarMockAdapter(
  rawApaarId: string,
  candidateName: string,
  candidateDob: string
): Promise<ApaarVerificationResult> {
  const cleanId = rawApaarId ? rawApaarId.replace(/\s+/g, '').trim() : '';
  const now = new Date().toISOString();

  // 1. Format check
  const formatResult = validateApaarFormat(cleanId);
  if (!formatResult.valid) {
    return {
      status: 'INVALID_FORMAT',
      isSimulated: true,
      apaarId: cleanId,
      nameMatchScore: 0,
      dobMatched: false,
      failureReason: formatResult.reason,
      timestamp: now,
    };
  }

  // 2. Lookup in synthetic national registry
  const record = SYNTHETIC_APAAR_REGISTRY[cleanId];
  if (!record) {
    // Generate synthetic verification if pattern matches standard test ranges or return NOT_FOUND
    if (cleanId.startsWith('99')) {
      return {
        status: 'NOT_FOUND',
        isSimulated: true,
        apaarId: cleanId,
        nameMatchScore: 0,
        dobMatched: false,
        failureReason: 'APAAR ID not registered in National Academic Bank of Credits (ABC) repository',
        timestamp: now,
      };
    }

    // Default to verified for general synthetic 12-digit IDs in prototype
    return {
      status: 'VERIFIED',
      isSimulated: true,
      apaarId: cleanId,
      registryName: candidateName,
      registryDob: candidateDob,
      nameMatchScore: 100,
      dobMatched: true,
      abcAccountId: `ABC-GEN-${cleanId.slice(-4)}`,
      timestamp: now,
    };
  }

  // 3. Name comparison
  const nameScore = calculateNameSimilarity(candidateName, record.legalName);
  const dobMatches = candidateDob ? candidateDob.trim() === record.dob.trim() : true;

  if (nameScore < 75) {
    return {
      status: 'NAME_MISMATCH',
      isSimulated: true,
      apaarId: cleanId,
      registryName: record.legalName,
      registryDob: record.dob,
      nameMatchScore: nameScore,
      dobMatched: dobMatches,
      failureReason: `Name mismatch: Registry name is "${record.legalName}", institution provided "${candidateName}" (Match: ${nameScore}%)`,
      abcAccountId: record.abcAccountId,
      timestamp: now,
    };
  }

  if (!dobMatches) {
    return {
      status: 'DOB_MISMATCH',
      isSimulated: true,
      apaarId: cleanId,
      registryName: record.legalName,
      registryDob: record.dob,
      nameMatchScore: nameScore,
      dobMatched: false,
      failureReason: `Date of Birth mismatch: Registry DOB is ${record.dob}, institution provided ${candidateDob}`,
      abcAccountId: record.abcAccountId,
      timestamp: now,
    };
  }

  return {
    status: 'VERIFIED',
    isSimulated: true,
    apaarId: cleanId,
    registryName: record.legalName,
    registryDob: record.dob,
    nameMatchScore: nameScore,
    dobMatched: true,
    abcAccountId: record.abcAccountId,
    timestamp: now,
  };
}
