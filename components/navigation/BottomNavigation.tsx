'use client'

import { CreditCard, Home, PiggyBank, Send, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const items = [
  { href: '/personal', label: 'Home', icon: Home },
  { href: '/kids', label: 'Kids', icon: PiggyBank },
  { href: '/transfer', label: 'Transfer', icon: Send },
  { href: '/cards', label: 'Cards', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: User },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[calc(env(safe-area-inset-bottom))]">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <span
                className={cn('flex h-8 w-11 items-center justify-center rounded-full transition-colors', isActive && 'bg-accent')}
              >
                <Icon className="h-5 w-5" />
              </span>
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
