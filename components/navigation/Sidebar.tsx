'use client'

import { Bell, CreditCard, Home, LineChart, LogOut, PiggyBank, Send, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AvatarCircle } from '@/components/ui/avatar-circle'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'

const items = [
  { href: '/personal', label: 'Personal Account', icon: Home },
  { href: '/kids', label: 'Kids Accounts', icon: PiggyBank },
  { href: '/transfer', label: 'Transfer & Payments', icon: Send },
  { href: '/cards', label: 'Cards', icon: CreditCard },
  { href: '/analytics', label: 'Analytics', icon: LineChart },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { parent, logout } = useAuth()
  const { unreadCount } = useNotifications()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <PiggyBank className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Piggy Bank</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              <span className="flex-1">{label}</span>
              {href === '/notifications' && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1 text-[11px] font-semibold text-sidebar-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-sidebar-accent/60">
          <AvatarCircle name={`${parent.firstName} ${parent.lastName}`} imageUrl={parent.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">
              {parent.firstName} {parent.lastName}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">@{parent.username}</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
