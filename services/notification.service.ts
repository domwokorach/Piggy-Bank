import { useBankStore } from '@/store/bank-store'
import { useToastStore } from '@/store/toast-store'
import { generateId } from '@/lib/utils'
import type { AppNotification, NotificationType, SecurityLoginAlert } from '@/types'

export interface PushNotificationOptions {
  actionLabel?: string
  actionHref?: string
  security?: SecurityLoginAlert
}

export function pushNotification(
  type: NotificationType,
  title: string,
  message: string,
  options?: PushNotificationOptions,
): void {
  const notification: AppNotification = {
    id: generateId('note'),
    type,
    title,
    message,
    date: new Date().toISOString(),
    read: false,
    actionLabel: options?.actionLabel,
    actionHref: options?.actionHref,
    security: options?.security,
  }

  useBankStore.getState().addNotification(notification)
  useToastStore.getState().enqueue(notification)
}

export function markRead(notificationId: string): void {
  useBankStore.getState().markNotificationRead(notificationId)
}

export function markAllRead(): void {
  useBankStore.getState().markAllNotificationsRead()
}

// A manual close (button click, clicking through to an action) implies the
// user actually saw it, so it's marked read in Notification History.
export function dismissToast(notificationId: string): void {
  useToastStore.getState().dismiss(notificationId)
  markRead(notificationId)
}

// A silent timeout expiry doesn't imply the user saw it — leave it unread.
export function autoDismissToast(notificationId: string): void {
  useToastStore.getState().dismiss(notificationId)
}
