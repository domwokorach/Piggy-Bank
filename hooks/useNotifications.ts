'use client'

import { useCallback, useMemo } from 'react'
import * as notificationService from '@/services/notification.service'
import { useBankStore } from '@/store/bank-store'

export function useNotifications() {
  const notifications = useBankStore((s) => s.notifications)
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const markRead = useCallback((notificationId: string) => notificationService.markRead(notificationId), [])
  const markAllRead = useCallback(() => notificationService.markAllRead(), [])

  return { notifications, unreadCount, markRead, markAllRead }
}
