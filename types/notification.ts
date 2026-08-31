export type NotificationType =
  | 'payment_received'
  | 'transfer_completed'
  | 'transfer_failed'
  | 'new_login'
  | 'suspicious_login'
  | 'card_frozen'
  | 'card_unlocked'
  | 'account_locked'
  | 'account_unlocked'
  | 'new_kid_account'
  | 'account_approved'
  | 'pin_verification'
  | 'savings_target_reached'
  | 'account_closure_requested'
  | 'account_closure_cancelled'
  | 'account_closed'

export interface SecurityLoginAlert {
  deviceLabel: string
  location: string
  dateTime: string
  confirmUrl: string
  blockUrl: string
}

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  date: string // ISO
  read: boolean
  actionLabel?: string
  actionHref?: string
  // Present only for new_login / suspicious_login toasts — powers the
  // "Yes, it was me" / "Secure Account" buttons.
  security?: SecurityLoginAlert
}
