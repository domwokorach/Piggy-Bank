'use client'

import { CreditCard, Wallet } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { BankCard } from '@/components/banking/BankCard'
import { FreezeCardControl } from '@/components/banking/FreezeCardControl'
import { TransactionList } from '@/components/banking/TransactionList'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { useKids } from '@/hooks/useKids'
import { useTransfers } from '@/hooks/useTransfers'

export default function CardDetailPage() {
  const { cardId } = useParams<{ cardId: string }>()
  const { getCard, kids } = useKids()
  const { getTransactionsForAccount } = useTransfers()

  const card = getCard(cardId)
  const kid = card ? kids.find((k) => k.id === card.ownerKidId) : undefined
  const transactions = getTransactionsForAccount(card?.ownerKidId)

  if (!card) {
    redirect('/cards')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Card" subtitle={card.cardholderName} back />

      <div className="mx-auto max-w-sm">
        <BankCard card={card} />
      </div>

      {card.status === 'frozen' && (
        <p className="text-center text-sm font-medium text-warning">Spending is disabled while this card is frozen.</p>
      )}
      {card.status === 'locked' && (
        <p className="text-center text-sm font-medium text-destructive">
          This card is locked and cannot be used until unlocked.
        </p>
      )}

      <FreezeCardControl card={card} />

      {kid && (
        <div className="mx-auto flex max-w-sm items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" />
            Available balance
          </div>
          <span className="text-sm font-semibold text-foreground">£{kid.balance.toFixed(2)}</span>
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">Card activity</h2>
        <div className="mt-1">
          {transactions.length === 0 ? (
            <EmptyState icon={CreditCard} title="No card activity yet" />
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </div>
      </section>
    </div>
  )
}
