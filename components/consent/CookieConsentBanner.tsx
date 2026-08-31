'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCookieConsentContext } from '@/components/consent/CookieConsentContext'

export function CookieConsentBanner() {
  const { isBannerOpen, isHydrated, acceptAll, rejectOptional, openSettings } = useCookieConsentContext()

  if (!isHydrated) return null

  return (
    <AnimatePresence>
      {isBannerOpen && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-heading"
          aria-describedby="cookie-consent-description"
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 32, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md sm:px-0 sm:pb-0"
        >
          <div className="flex flex-col gap-3 rounded-xl bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Cookie className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 id="cookie-consent-heading" className="font-heading text-sm font-medium leading-snug">
                  How we use cookies
                </h2>
                <p id="cookie-consent-description" className="text-xs leading-relaxed text-muted-foreground">
                  Essential cookies are required for the app to work. Optional cookies help us with
                  analytics, remembering your preferences, and improving your experience — only with
                  your permission.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Button variant="outline" size="lg" className="w-full" onClick={rejectOptional}>
                Reject optional
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={openSettings}>
                Manage cookies
              </Button>
              <Button size="lg" className="w-full" onClick={acceptAll}>
                Accept optional
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
