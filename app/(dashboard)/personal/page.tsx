'use client'

import { ChevronRight, CreditCard, LineChart, PiggyBank, Send, Wallet } from 'lucide-react'
import Link from 'next/link'
import { AvatarCircle } from '@/components/ui/avatar-circle'
import { BalanceCard } from '@/components/accounts/BalanceCard'
import { KidCard } from '@/components/accounts/KidCard'
import { EmptyState } from '@/components/ui/empty-state'
import { MonthlyGraph } from '@/components/charts/MonthlyGraph'
import { QuickAction } from '@/components/ui/quick-action'
import { TransactionList } from '@/components/banking/TransactionList'
import { useAuth } from '@/hooks/useAuth'
import { useGreeting } from '@/hooks/useGreeting'
import { useKids } from '@/hooks/useKids'
import { useTransfers } from '@/hooks/useTransfers'

export default function PersonalPage() {
  const { parent } = useAuth()
  const { kids } = useKids()
  const { recentParentTransactions, monthlyActivity } = useTransfers()

  const greeting = useGreeting(parent?.firstName)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AvatarCircle name={`${parent.firstName} ${parent.lastName}`} imageUrl={parent.avatarUrl} size="lg" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{greeting}</h1>
          <p className="text-sm text-muted-foreground">Personal Account</p>
        </div>
      </div>

      <BalanceCard label="Available balance" balance={parent.balance} subtitle="Personal Parent Account" />

      <div className="grid grid-cols-4 gap-3">
        <QuickAction href="/kids" icon={PiggyBank} label="Kids" />
        <QuickAction href="/transfer" icon={Send} label="Transfer" />
        <QuickAction href="/transfer?mode=payment" icon={Wallet} label="Payments" />
        <QuickAction href="/cards" icon={CreditCard} label="Cards" />
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Kids Accounts</h2>
          <Link href="/kids" className="flex items-center gap-0.5 text-sm font-medium text-primary hover:underline">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {kids.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={PiggyBank} title="No kids linked yet" description="Add your first kid account to get started." />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {kids.map((kid) => (
              <KidCard key={kid.id} kid={kid} variant="compact" />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Monthly activity</h2>
          <Link href="/analytics" className="flex items-center gap-0.5 text-sm font-medium text-primary hover:underline">
            <LineChart className="h-4 w-4" /> Analytics
          </Link>
        </div>
        <div className="mt-4">
          <MonthlyGraph data={monthlyActivity.slice(-6)} visibleSeries={['toKids', 'spending']} height={180} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">Recent transactions</h2>
        <div className="mt-1">
          <TransactionList transactions={recentParentTransactions} emptyDescription="Your recent activity will appear here." />
        </div>
      </section>
    </div>
  )
}
