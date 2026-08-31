'use client'

import { ArrowRight, PiggyBank, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CookieSettingsLink } from '@/components/consent/CookieSettingsLink'
import { useAuth } from '@/hooks/useAuth'

const features = [
  {
    icon: Wallet,
    title: 'Send allowances instantly',
    description: 'Pay your kids in seconds and watch their balance update in real time.',
  },
  {
    icon: ShieldCheck,
    title: 'Stay in control',
    description: 'Freeze cards, set savings targets and approve every transfer.',
  },
  {
    icon: Sparkles,
    title: 'Kids learn to save',
    description: 'Savings goals and clear balances help kids build healthy habits.',
  },
]

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    redirect('/personal')
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 md:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PiggyBank className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Piggy Bank</span>
        </div>
        <div className="flex items-center gap-2">
          <Button render={<Link href="/login" />} nativeButton={false} variant="ghost" className="h-9 px-4">
            Log in
          </Button>
          <Button render={<Link href="/register" />} nativeButton={false} className="h-9 px-4">
            Get started
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10 md:px-8 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            Family banking, reimagined
          </span>
          <h1 className="mx-auto mt-5 text-center text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
            Banking that grows with your family.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            One secure account for you, and connected accounts and cards for every child. Send money, set savings goals
            and stay in full control.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button render={<Link href="/register" />} nativeButton={false} size="lg" className="h-12 px-6 text-base">
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button render={<Link href="/login" />} nativeButton={false} variant="outline" size="lg" className="h-12 px-6 text-base">
              I already have an account
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="mt-16 grid gap-4 sm:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 font-semibold text-foreground">{title}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="mx-auto flex max-w-5xl flex-col items-center gap-2 border-t border-border px-5 py-6 text-xs text-muted-foreground md:flex-row md:justify-between md:px-8">
        <p>© {new Date().getFullYear()} Piggy Bank Ltd. UK regulated prototype.</p>
        <CookieSettingsLink />
      </footer>
    </div>
  )
}
