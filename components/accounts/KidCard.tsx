import Link from 'next/link'
import { AvatarCircle } from '@/components/ui/avatar-circle'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
import type { BankCard, Kid } from '@/types'

interface KidCardProps {
  kid: Kid
  card?: BankCard
  variant?: 'full' | 'compact'
}

export function KidCard({ kid, card, variant = 'full' }: KidCardProps) {
  const progress = Math.min(100, (kid.savingsProgress / kid.savingsTarget) * 100)

  if (variant === 'compact') {
    return (
      <Link
        href={`/kids/${kid.id}`}
        className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted"
      >
        <AvatarCircle name={kid.name} color={kid.color} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{kid.name}</p>
          <p className="text-xs text-muted-foreground">{formatCurrency(kid.balance)}</p>
          <Progress value={progress} className="mt-1.5" />
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/kids/${kid.id}`}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <AvatarCircle name={kid.name} color={kid.color} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{kid.name}</p>
          <p className="text-xs text-muted-foreground">
            Card •••• {card?.last4}
            {card?.status === 'frozen' && <span className="font-medium text-warning"> · Frozen</span>}
            {card?.status === 'locked' && <span className="font-medium text-destructive"> · Locked</span>}
          </p>
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {formatCurrency(kid.balance)}
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Savings goal</span>
          <span className="font-medium text-foreground">
            {formatCurrency(kid.savingsProgress)} / {formatCurrency(kid.savingsTarget)}
          </span>
        </div>
        <Progress value={progress} className="mt-1.5" />
      </div>
    </Link>
  )
}
