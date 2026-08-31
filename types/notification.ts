export type NotificationType =
  | 'payment_received'
  | 'transfer_completed'
  | 'transfer_failed'
  | 'card_frozen'
  | 'card_unlocked'
  | 'new_kid_account'
  | 'account_approved'
  | 'pin_verification'
  | 'savings_target_reached'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  date: string // ISO
  read: boolean
}
