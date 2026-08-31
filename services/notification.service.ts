import { useBankStore } from '@/store/bank-store'
import { generateId } from '@/lib/utils'
import type { NotificationType } from '@/types'

export function pushNotification(type: NotificationType, title: string, message: string): void {
  useBankStore.getState().addNotification({
    id: generateId('note'),
    type,
    title,
    message,
    date: new Date().toISOString(),
    read: false,
  })
}

export function markRead(notificationId: string): void {
  useBankStore.getState().markNotificationRead(notificationId)
}

export function markAllRead(): void {
  useBankStore.getState().markAllNotificationsRead()
}
