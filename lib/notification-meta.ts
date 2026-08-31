import {
  Ban,
  CheckCheck,
  Lock,
  LogIn,
  Eye,
  Mail,
  PiggyBank,
  ShieldAlert,
  ShieldCheck,
  Snowflake,
  Target,
  Unlock,
  Wallet,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { NotificationType } from '@/types'

export type NotificationLevel = 'SUCCESS' | 'INFO' | 'WARNING' | 'SECURITY' | 'ERROR'

export const notificationIcon: Record<NotificationType, LucideIcon> = {
  payment_received: Wallet,
  transfer_completed: CheckCheck,
  transfer_failed: XCircle,
  new_login: LogIn,
  suspicious_login: ShieldAlert,
  card_frozen: Snowflake,
  card_unlocked: Unlock,
  account_locked: Lock,
  account_unlocked: Unlock,
  new_kid_account: PiggyBank,
  account_approved: ShieldCheck,
  pin_verification: Mail,
  savings_target_reached: Target,
  account_closure_requested: ShieldAlert,
  account_closure_cancelled: ShieldCheck,
  account_closed: Ban,
  card_details_viewed: Eye,
}

export const notificationLevel: Record<NotificationType, NotificationLevel> = {
  payment_received: 'SUCCESS',
  transfer_completed: 'SUCCESS',
  transfer_failed: 'ERROR',
  new_login: 'SECURITY',
  suspicious_login: 'SECURITY',
  card_frozen: 'WARNING',
  card_unlocked: 'SUCCESS',
  account_locked: 'WARNING',
  account_unlocked: 'SUCCESS',
  new_kid_account: 'INFO',
  account_approved: 'SUCCESS',
  pin_verification: 'INFO',
  savings_target_reached: 'SUCCESS',
  account_closure_requested: 'WARNING',
  account_closure_cancelled: 'INFO',
  account_closed: 'WARNING',
  card_details_viewed: 'SECURITY',
}

// Tailwind classes keyed by level, not type — the icon carries the specific
// meaning; colour is reinforcement only (never the sole signal).
export const levelTone: Record<NotificationLevel, string> = {
  SUCCESS: 'bg-success/10 text-success',
  INFO: 'bg-accent text-accent-foreground',
  WARNING: 'bg-warning/10 text-warning',
  SECURITY: 'bg-primary/10 text-primary',
  ERROR: 'bg-destructive/10 text-destructive',
}

export function toneForType(type: NotificationType): string {
  return levelTone[notificationLevel[type]]
}
