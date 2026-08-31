'use client'

import { useMemo, useState } from 'react'
import { MonthlyGraph } from '@/components/charts/MonthlyGraph'
import { PageHeader } from '@/components/ui/page-header'
import { useTransfers } from '@/hooks/useTransfers'
import { cn, formatCurrency } from '@/lib/utils'
import type { MonthlyActivity } from '@/types'

type SeriesKey = keyof Omit<MonthlyActivity, 'month'>

const seriesOptions: { key: SeriesKey; label: string }[] = [
  { key: 'toKids', label: 'To kids' },
  { key: 'received', label: 'Received' },
  { key: 'savings', label: 'Savings' },
  { key: 'spending', label: 'Spending' },
]

export default function AnalyticsPage() {
  const { monthlyActivity } = useTransfers()
  const [active, setActive] = useState<SeriesKey[]>(['toKids', 'received', 'savings', 'spending'])

  const toggle = (key: SeriesKey) => {
    setActive((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const totals = useMemo(() => {
    const sum = (key: SeriesKey) => monthlyActivity.reduce((acc, m) => acc + m[key], 0)
    return {
      toKids: sum('toKids'),
      received: sum('received'),
      savings: sum('savings'),
      spending: sum('spending'),
    }
  }, [monthlyActivity])

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Your family's account activity this year" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Sent to kids" value={totals.toKids} />
        <StatTile label="Received" value={totals.received} />
        <StatTile label="Saved" value={totals.savings} />
        <StatTile label="Spent" value={totals.spending} />
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Monthly account activity</h2>
          <div className="flex flex-wrap gap-1.5">
            {seriesOptions.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => toggle(s.key)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  active.includes(s.key)
                    ? 'border-primary bg-accent text-accent-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <MonthlyGraph data={monthlyActivity} visibleSeries={active.length ? active : undefined} height={280} />
        </div>
      </section>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-lg font-semibold tracking-tight text-foreground tabular-nums">{formatCurrency(value)}</p>
    </div>
  )
}
