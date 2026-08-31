'use client'

import type { ReactNode } from 'react'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import { CookieConsentContext } from '@/components/consent/CookieConsentContext'
import { CookieConsentBanner } from '@/components/consent/CookieConsentBanner'
import { CookieSettingsModal } from '@/components/consent/CookieSettingsModal'
import { GoogleAnalyticsGate } from '@/components/consent/GoogleAnalyticsGate'

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const consent = useCookieConsent()

  return (
    <CookieConsentContext.Provider value={consent}>
      {children}
      <CookieConsentBanner />
      <CookieSettingsModal />
      <GoogleAnalyticsGate />
    </CookieConsentContext.Provider>
  )
}
