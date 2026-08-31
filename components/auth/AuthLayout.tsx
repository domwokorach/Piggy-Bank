import type { ReactNode } from 'react'
import { PiggyBank } from 'lucide-react'
import Link from 'next/link'
import { CookieSettingsLink } from '@/components/consent/CookieSettingsLink'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="hidden flex-1 flex-col justify-between bg-primary p-10 text-primary-foreground md:flex md:w-[42%] md:fixed md:inset-y-0 md:left-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <PiggyBank className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Piggy Bank</span>
        </Link>
        <div>
          <p className="text-3xl font-semibold leading-tight tracking-tight">
            Family banking, built for parents and kids.
          </p>
          <p className="mt-3 max-w-sm text-sm text-primary-foreground/70">
            Send allowances, set savings goals, and manage kids&apos; cards from one secure account.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Piggy Bank Ltd. UK regulated prototype.</p>
          <span aria-hidden>·</span>
          <CookieSettingsLink className="underline-offset-4 hover:text-primary-foreground/80 hover:underline" />
        </div>
      </div>

      <div className="flex flex-1 flex-col md:ml-[42%]">
        <div className="flex items-center justify-center px-5 py-6 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PiggyBank className="h-4.5 w-4.5" />
            </div>
            <span className="font-semibold tracking-tight text-foreground">Piggy Bank</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-10 md:px-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <div className="flex justify-center pb-6 md:hidden">
          <CookieSettingsLink />
        </div>
      </div>
    </div>
  )
}
