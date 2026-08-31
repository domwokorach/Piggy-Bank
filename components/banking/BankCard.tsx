import { Lock, PiggyBank, Snowflake } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BankCard as BankCardModel, CardDesign } from '@/types'

const designStyles: Record<CardDesign, string> = {
  navy: 'from-[#0a2a6b] via-[#123a8c] to-[#050f2c]',
  midnight: 'from-[#0c1330] via-[#1a2352] to-[#03060f]',
  sky: 'from-[#2f6fed] via-[#245bd0] to-[#0a2a6b]',
  slate: 'from-[#334155] via-[#1e293b] to-[#0f172a]',
}

interface BankCardProps {
  card: BankCardModel
  className?: string
}

export function BankCard({ card, className }: BankCardProps) {
  const frozen = card.status === 'frozen'
  const locked = card.status === 'locked'

  return (
    <div
      className={cn(
        'relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg',
        designStyles[card.design],
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-white/90">
          <PiggyBank className="h-4 w-4" />
          Piggy Bank
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-white/70">Debit</span>
      </div>

      <div className="relative mt-6 font-mono text-lg tracking-[0.2em] text-white/95 sm:text-xl">
        •••• •••• •••• {card.last4}
      </div>

      <div className="relative mt-5 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/60">Cardholder</p>
          <p className="text-sm font-medium">{card.cardholderName}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/60">Expires</p>
          <p className="text-sm font-medium">{card.expiry}</p>
        </div>
      </div>

      {(frozen || locked) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 backdrop-blur-[2px]">
          {frozen ? <Snowflake className="h-6 w-6 text-white" /> : <Lock className="h-6 w-6 text-white" />}
          <span className="text-sm font-semibold uppercase tracking-widest text-white">
            {frozen ? 'Card Frozen' : 'Card Locked'}
          </span>
        </div>
      )}
    </div>
  )
}
