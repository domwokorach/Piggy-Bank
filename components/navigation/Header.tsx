'use client'

import { Bell, PiggyBank } from 'lucide-react'
import Link from 'next/link'
import { AvatarCircle } from '@/components/ui/avatar-circle'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'

export function Header() {
  const { parent } = useAuth()
  const { unreadCount } = useNotifications()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <Link href="/personal" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <PiggyBank className="h-4.5 w-4.5" />
        </div>
        <span className="font-semibold tracking-tight text-foreground">Piggy Bank</span>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />}
        </Link>
        <Link href="/settings" aria-label="Settings">
          <AvatarCircle name={`${parent.firstName} ${parent.lastName}`} imageUrl={parent.avatarUrl} size="sm" />
        </Link>
      </div>
    </header>
  )
}
