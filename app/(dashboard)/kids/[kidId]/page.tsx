'use client'

import { ArrowLeftRight, CreditCard, Send, Target, Wallet } from 'lucide-react'
import Link from 'next/link'
import { redirect, useParams } from 'next/navigation'
import { AvatarCircle } from '@/components/ui/avatar-circle'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { TransactionList } from '@/components/banking/TransactionList'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useKids } from '@/hooks/useKids'
import { useTransfers } from '@/hooks/useTransfers'
import { formatCurrency } from '@/lib/utils'

export default function KidDetailPage() {
  const { kidId } = useParams<{ kidId: string }>()
  const { getKid, getCardForKid } = useKids()
  const { getTransactionsForAccount } = useTransfers()

  const kid = getKid(kidId)
  const card = kid ? getCardForKid(kid.id) : undefined
  const transactions = getTransactionsForAccount(kidId)

  if (!kid) {
    redirect('/kids')
  }

  const progress = Math.min(100, (kid.savingsProgress / kid.savingsTarget) * 100)

  return (
    <div className="space-y-6">
      <PageHeader title={kid.name} subtitle="Kid Account" back />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <AvatarCircle name={kid.name} color={kid.color} size="xl" />
          <div>
            <p className="text-sm text-muted-foreground">Available balance</p>
            <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">{formatCurrency(kid.balance)}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button render={<Link href={`/transfer?mode=payment&kidId=${kid.id}`} />} nativeButton={false} className="h-11">
            <Send className="h-4 w-4" />
            Send payment
          </Button>
          <Button
            render={<Link href={`/transfer?direction=kidToParent&kidId=${kid.id}`} />}
            nativeButton={false}
            variant="outline"
            className="h-11"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Move to parent
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Target className="h-4 w-4 text-muted-foreground" />
          Savings target
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{formatCurrency(kid.savingsProgress)} saved</span>
          <span className="font-medium text-foreground">Goal {formatCurrency(kid.savingsTarget)}</span>
        </div>
        <Progress value={progress} className="mt-2" />
      </div>

      {card && (
        <Link
          href={`/cards/${card.id}`}
          className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Card •••• {card.last4}</p>
              <p className="text-xs text-muted-foreground">Tap to manage card</p>
            </div>
          </div>
          <Badge variant={card.status === 'active' ? 'secondary' : card.status === 'frozen' ? 'outline' : 'destructive'}>
            {card.status === 'active' ? 'Active' : card.status === 'frozen' ? 'Frozen' : 'Locked'}
          </Badge>
        </Link>
      )}

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">Transfer history</h2>
        <div className="mt-1">
          {transactions.length === 0 ? (
            <EmptyState icon={Wallet} title="No transactions yet" description="Payments and spending will show up here." />
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </div>
      </section>
    </div>
  )
}
