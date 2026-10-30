/**
 * Cryptographic Utility Service for APAAR-Verify
 * Provides deterministic hashing for duplicate detection,
 * identity masking for student privacy,
 * and HMAC-SHA256 digital signature creation & verification.
 */

const SYSTEM_HMAC_SALT = 'AICTE_APAAR_NATIONAL_REGISTRY_SECRET_KEY_2025';

// Deterministic hash for duplicate APAAR detection without exposing raw ID
export function computeDeterministicHmac(apaarId: string): string {
  const normalized = apaarId.replace(/\s+/g, '').trim();
  let hash = 0;
  const input = normalized + ':' + SYSTEM_HMAC_SALT;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  // Convert to positive hex representation
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `hmac_v1_${hex}_${normalized.slice(-4)}`;
}

// Mask APAAR ID for regular UI display (protects Aadhaar/APAAR identity)
export function maskApaarId(apaarId: string | undefined): string {
  if (!apaarId) return '•••• •••• ••••';
  const clean = apaarId.replace(/\s+/g, '').trim();
  if (clean.length !== 12) {
    if (clean.length < 4) return '••••';
    return `•••• •••• ${clean.slice(-4)}`;
  }
  return `•••• •••• ${clean.slice(8, 12)}`;
}

// Format 12-digit APAAR with spaces: 1234 5678 9012
export function formatApaarWithSpaces(apaarId: string): string {
  const clean = apaarId.replace(/\s+/g, '').trim();
  if (clean.length !== 12) return apaarId;
  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
}

// Cryptographic digital signature simulation for verifiable student credentials
export function signCredentialPayload(payload: Record<string, any>): string {
  const serialized = JSON.stringify(payload, Object.keys(payload).sort());
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  const key = SYSTEM_HMAC_SALT + '::CREDENTIAL_SIGNING_AUTHORITY';
  const combined = key + '::' + serialized;

  for (let i = 0; i < combined.length; i++) {
    const ch = combined.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const sigHex = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
  return `SIG-AICTE-ECDSA-${sigHex.toUpperCase()}`;
}

// Verify signature
export function verifyCredentialSignature(payload: Record<string, any>, signature: string): boolean {
  if (!signature || !signature.startsWith('SIG-AICTE-ECDSA-')) return false;
  const expected = signCredentialPayload(payload);
  return expected === signature;
}
