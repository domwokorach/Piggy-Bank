'use client'

import { createContext, useContext } from 'react'
import type { UseCookieConsentReturn } from '@/hooks/useCookieConsent'

export const CookieConsentContext = createContext<UseCookieConsentReturn | null>(null)

export function useCookieConsentContext(): UseCookieConsentReturn {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error('useCookieConsentContext must be used within a CookieConsentProvider')
  }
  return context
}
