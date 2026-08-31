'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { notificationIcon, notificationLevel, toneForType, type NotificationLevel } from '@/lib/notification-meta'
import { formatDateTime } from '@/lib/utils'
import { SecurityLoginAlertContent } from './SecurityLoginAlertContent'
import type { AppNotification } from '@/types'

const AUTO_DISMISS_MS = 5000

function isPersistent(level: NotificationLevel): boolean {
  return level === 'SECURITY' || level === 'ERROR'
}

interface NotificationToastProps {
  notification: AppNotification
  onDismiss: () => void
  onAutoDismiss: () => void
}

export function NotificationToast({ notification, onDismiss, onAutoDismiss }: NotificationToastProps) {
  const reduceMotion = useReducedMotion()

  const level = notificationLevel[notification.type]
  const persistent = isPersistent(level)
  const Icon = notificationIcon[notification.type]
  const tone = toneForType(notification.type)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const startTimer = () => {
    if (persistent) return
    clearTimer()
    timeoutRef.current = setTimeout(onAutoDismiss, AUTO_DISMISS_MS)
  }

  useEffect(() => {
    startTimer()
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onDismiss()
  }

  return (
    <motion.div
      role={persistent ? 'alert' : 'status'}
      aria-live={persistent ? 'assertive' : 'polite'}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.98 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.98 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.25, ease: 'easeOut' }}
      className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{notification.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(notification.date)}</p>

          {notification.security && (
            <div className="mt-2">
              <SecurityLoginAlertContent security={notification.security} onResolved={onDismiss} />
            </div>
          )}

          {notification.actionLabel && notification.actionHref && (
            <Link
              href={notification.actionHref}
              onClick={onDismiss}
              className="mt-2.5 inline-block text-xs font-medium text-primary hover:underline"
            >
              {notification.actionLabel}
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
