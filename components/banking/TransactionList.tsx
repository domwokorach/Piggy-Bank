import { createElement } from 'react'
import { ArrowDownLeft, ArrowUpRight, PiggyBank, ShoppingBag, Wallet } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/empty-state'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

const iconFor = (txn: Transaction) => {
  if (txn.type === 'savings') return PiggyBank
  if (txn.type === 'spend') return ShoppingBag
  return txn.direction === 'in' ? ArrowDownLeft : ArrowUpRight
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isIn = transaction.direction === 'in'
  const icon = iconFor(transaction)

  return (
    <Link
      href={`/transactions/${transaction.transactionNumber}`}
      className="flex items-center gap-3 py-3 transition-colors hover:bg-muted"
    >
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
          isIn ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
        )}
      >
        {createElement(icon, { className: 'h-5 w-5' })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{transaction.counterparty}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">{transaction.transactionNumber}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn('text-sm font-semibold', isIn ? 'text-success' : 'text-foreground')}>
          {isIn ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
      </div>
    </Link>
  )
}

interface TransactionListProps {
  transactions: Transaction[]
  emptyTitle?: string
  emptyDescription?: string
}

export function TransactionList({
  transactions,
  emptyTitle = 'No transactions yet',
  emptyDescription = 'Activity will appear here.',
}: TransactionListProps) {
  if (transactions.length === 0) {
    return <EmptyState icon={Wallet} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="divide-y divide-border">
      {transactions.map((t) => (
        <TransactionRow key={t.id} transaction={t} />
      ))}
    </div>
  )
}
