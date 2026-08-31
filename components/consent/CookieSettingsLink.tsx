'use client'

import { useCookieConsentContext } from '@/components/consent/CookieConsentContext'

export function CookieSettingsLink({ className }: { className?: string }) {
  const { openSettings } = useCookieConsentContext()

  return (
    <button
      type="button"
      onClick={openSettings}
      className={className ?? 'text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline'}
    >
      Cookie Settings
    </button>
  )
}
