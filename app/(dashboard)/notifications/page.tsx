'use client'

import { Bell, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'
import { notificationIcon, toneForType } from '@/lib/notification-meta'
import { cn, formatRelativeTime } from '@/lib/utils'

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
            const Icon = notificationIcon[n.type]
            return (
              <div
                key={n.id}
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl border p-4 text-left shadow-sm transition-colors',
                  n.read ? 'border-border bg-card' : 'border-primary/20 bg-accent/40',
                )}
              >
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', toneForType(n.type))}
                  aria-label="Mark as read"
                >
                  <Icon className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => markRead(n.id)} className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(n.date)}</p>
                </button>
                {n.actionLabel && n.actionHref && (
                  <Link
                    href={n.actionHref}
                    onClick={() => markRead(n.id)}
                    className="shrink-0 self-center text-xs font-medium text-primary hover:underline"
                  >
                    {n.actionLabel}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
