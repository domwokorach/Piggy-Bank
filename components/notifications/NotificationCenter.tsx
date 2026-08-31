'use client'

import { AnimatePresence } from 'motion/react'
import { NotificationToast } from './NotificationToast'
import { SecurityLoginAlertContent } from './SecurityLoginAlertContent'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { notificationIcon, toneForType } from '@/lib/notification-meta'
import { useToasts } from '@/hooks/useToasts'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/**
 * Mounted once at the root layout. Renders live toast pop-ups for every
 * pushNotification() call across the app (see services/notification.service.ts).
 * Security alerts (new/suspicious login) get a bottom sheet on mobile, where
 * a floating toast wouldn't have room for the device/location detail and two
 * action buttons — everything else stays a compact toast everywhere.
 */
export function NotificationCenter() {
  const { visible, dismiss, autoDismiss } = useToasts()
  const isMobile = useMediaQuery('(max-width: 767px)')

  const mobileSecurityToast = isMobile ? visible.find((n) => n.security) : undefined
  const stackToasts = mobileSecurityToast ? visible.filter((n) => n.id !== mobileSecurityToast.id) : visible

  const SecurityIcon = mobileSecurityToast ? notificationIcon[mobileSecurityToast.type] : null

  return (
    <>
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-16 z-60 flex flex-col items-center gap-2 px-4 md:inset-x-auto md:top-4 md:right-4 md:left-auto md:items-end md:px-0"
      >
        <AnimatePresence initial={false}>
          {stackToasts.map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onDismiss={() => dismiss(notification.id)}
              onAutoDismiss={() => autoDismiss(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {mobileSecurityToast && (
        <Sheet open onOpenChange={(open) => !open && dismiss(mobileSecurityToast.id)}>
          <SheetContent side="bottom" className="p-5">
            <SheetHeader className="p-0">
              <div className="flex items-center gap-3">
                {SecurityIcon && (
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toneForType(mobileSecurityToast.type)}`}>
                    <SecurityIcon className="h-4.5 w-4.5" />
                  </div>
                )}
                <div>
                  <SheetTitle>{mobileSecurityToast.title}</SheetTitle>
                  <SheetDescription>{mobileSecurityToast.message}</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            {mobileSecurityToast.security && (
              <SecurityLoginAlertContent
                security={mobileSecurityToast.security}
                onResolved={() => dismiss(mobileSecurityToast.id)}
              />
            )}
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
