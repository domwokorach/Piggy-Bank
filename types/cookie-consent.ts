export type OptionalCookieCategory = 'analytics' | 'preferences' | 'marketing'

export interface CookiePreferences {
  essential: true
  analytics: boolean
  preferences: boolean
  marketing: boolean
}

export interface CookieConsentRecord {
  policyVersion: number
  preferences: CookiePreferences
  consentedAt: string
}
