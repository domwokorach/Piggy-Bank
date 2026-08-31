'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ALL_ACCEPTED_PREFERENCES,
  ESSENTIAL_ONLY_PREFERENCES,
  getConsentRecord,
  isConsentCurrent,
  resetConsent as resetConsentRecord,
  saveConsent,
} from '@/services/cookie-consent.service'
import type { CookiePreferences } from '@/types/cookie-consent'

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>(ESSENTIAL_ONLY_PREFERENCES)
  const [isBannerOpen, setIsBannerOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const record = getConsentRecord()
    if (isConsentCurrent(record)) {
      setPreferences(record.preferences)
      setIsBannerOpen(false)
    } else {
      setIsBannerOpen(true)
    }
    setIsHydrated(true)
  }, [])

  const persist = useCallback((next: CookiePreferences) => {
    saveConsent(next)
    setPreferences(next)
    setIsBannerOpen(false)
    setIsSettingsOpen(false)
  }, [])

  const acceptAll = useCallback(() => persist(ALL_ACCEPTED_PREFERENCES), [persist])
  const rejectOptional = useCallback(() => persist(ESSENTIAL_ONLY_PREFERENCES), [persist])
  const savePreferences = useCallback(
    (next: CookiePreferences) => persist({ ...next, essential: true }),
    [persist]
  )

  const openSettings = useCallback(() => setIsSettingsOpen(true), [])
  const closeSettings = useCallback(() => setIsSettingsOpen(false), [])

  const resetConsent = useCallback(() => {
    resetConsentRecord()
    setPreferences(ESSENTIAL_ONLY_PREFERENCES)
    setIsSettingsOpen(false)
    setIsBannerOpen(true)
  }, [])

  return {
    preferences,
    isBannerOpen,
    isSettingsOpen,
    isHydrated,
    acceptAll,
    rejectOptional,
    savePreferences,
    openSettings,
    closeSettings,
    resetConsent,
  }
}

export type UseCookieConsentReturn = ReturnType<typeof useCookieConsent>
