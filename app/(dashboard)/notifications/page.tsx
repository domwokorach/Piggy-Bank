'use client'

import { Bell, CheckCheck, Lock, PiggyBank, ShieldCheck, Snowflake, Target, Wallet, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { NotificationType } from '@/types'

const iconFor: Record<NotificationType, LucideIcon> = {
  payment_received: Wallet,
  transfer_completed: CheckCheck,
  transfer_failed: XCircle,
  card_frozen: Snowflake,
  card_unlocked: Lock,
  new_kid_account: PiggyBank,
  account_approved: ShieldCheck,
  pin_verification: ShieldCheck,
  savings_target_reached: Target,
}

const toneFor: Record<NotificationType, string> = {
  payment_received: 'bg-success/10 text-success',
  transfer_completed: 'bg-success/10 text-success',
  transfer_failed: 'bg-destructive/10 text-destructive',
  card_frozen: 'bg-warning/10 text-warning',
  card_unlocked: 'bg-accent text-accent-foreground',
  new_kid_account: 'bg-accent text-accent-foreground',
  account_approved: 'bg-success/10 text-success',
  pin_verification: 'bg-accent text-accent-foreground',
  savings_target_reached: 'bg-accent text-accent-foreground',
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        action={
          unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )
        }
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = iconFor[n.type]
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => markRead(n.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl border p-4 text-left shadow-sm transition-colors',
                  n.read ? 'border-border bg-card' : 'border-primary/20 bg-accent/40',
                )}
              >
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', toneFor[n.type])}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(n.date)}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
