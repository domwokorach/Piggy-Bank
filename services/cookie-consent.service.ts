import { readStorage, removeStorage, writeStorage } from '@/lib/storage'
import type { CookieConsentRecord, CookiePreferences } from '@/types/cookie-consent'

const STORAGE_KEY = 'piggybank.cookie-consent'

// Bump this whenever the cookie policy changes materially — it forces the banner
// to reappear for users who already consented under an older policy.
export const CONSENT_POLICY_VERSION = 1

export const ESSENTIAL_ONLY_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  preferences: false,
  marketing: false,
}

export const ALL_ACCEPTED_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: true,
  preferences: true,
  marketing: true,
}

export function getConsentRecord(): CookieConsentRecord | null {
  return readStorage<CookieConsentRecord>(STORAGE_KEY)
}

export function isConsentCurrent(record: CookieConsentRecord | null): record is CookieConsentRecord {
  return record !== null && record.policyVersion === CONSENT_POLICY_VERSION
}

export function saveConsent(preferences: CookiePreferences): CookieConsentRecord {
  const record: CookieConsentRecord = {
    policyVersion: CONSENT_POLICY_VERSION,
    preferences: { ...preferences, essential: true },
    consentedAt: new Date().toISOString(),
  }
  writeStorage(STORAGE_KEY, record)
  return record
}

export function resetConsent(): void {
  removeStorage(STORAGE_KEY)
}
