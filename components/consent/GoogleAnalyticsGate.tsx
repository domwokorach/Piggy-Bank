'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { useCookieConsentContext } from '@/components/consent/CookieConsentContext'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID

export function GoogleAnalyticsGate() {
  const { preferences, isHydrated } = useCookieConsentContext()

  if (!GA_MEASUREMENT_ID || !isHydrated || !preferences.analytics) return null

  return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
}
