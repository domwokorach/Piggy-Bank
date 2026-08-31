'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Copy, CopyCheck, Download, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { fetchTransaction, type RemoteTransaction } from '@/services/transaction.service'
import { downloadReceipt } from '@/lib/receipt'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

const statusVariant: Record<RemoteTransaction['status'], 'secondary' | 'outline' | 'destructive'> = {
  pending: 'outline',
  processing: 'outline',
  completed: 'secondary',
  failed: 'destructive',
  cancelled: 'destructive',
  reversed: 'destructive',
}

export default function TransactionDetailsPage() {
  const params = useParams<{ transactionNumber: string }>()
  const transactionNumber = decodeURIComponent(params.transactionNumber)

  const [transaction, setTransaction] = useState<RemoteTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchTransaction(transactionNumber).then((result) => {
      if (cancelled) return
      if (result.ok) {
        setTransaction(result.transaction)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [transactionNumber])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transactionNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard access denied — ignore, the number is already visible on screen
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Transaction details" back />

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!loading && notFound && (
        <EmptyState
          icon={Wallet}
          title="Transaction not found"
          description="We couldn't find a transaction with that reference."
        />
      )}

      {!loading && transaction && (
        <div className="max-w-md space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Transaction Number</p>
              <p className="truncate font-mono text-sm font-semibold text-foreground">{transaction.transactionNumber}</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {copied ? <CopyCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="divide-y divide-border rounded-xl border border-border">
            <Row label="Date" value={formatDate(transaction.createdAt)} />
            <Row label="Time" value={formatTime(transaction.createdAt)} />
            <Row label="From" value={transaction.fromLabel} />
            <Row label="To" value={transaction.toLabel} />
            <Row label="Amount" value={formatCurrency(transaction.amount)} emphasis />
            <Row label="Reference" value={transaction.reference ?? '—'} />
            <Row label="Transaction Type" value={transaction.type} className="capitalize" />
            <Row
              label="Status"
              value={<Badge variant={statusVariant[transaction.status]} className="capitalize">{transaction.status}</Badge>}
            />
          </div>

          <Button variant="outline" className="h-11 w-full" onClick={() => downloadReceipt(transaction)}>
            <Download className="h-4 w-4" />
            Download receipt
          </Button>
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  emphasis,
  className,
}: {
  label: string
  value: ReactNode
  emphasis?: boolean
  className?: string
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={
          className ?? (emphasis ? 'text-base font-semibold text-foreground' : 'text-sm font-medium text-foreground')
        }
      >
        {value}
      </span>
    </div>
  )
}
