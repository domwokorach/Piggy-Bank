'use client'

import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn, formatCurrency } from '@/lib/utils'

interface BalanceCardProps {
  label: string
  balance: number
  subtitle?: string
  tone?: 'primary' | 'card'
  action?: ReactNode
  className?: string
}

export function BalanceCard({ label, balance, subtitle, tone = 'primary', action, className }: BalanceCardProps) {
  const isPrimary = tone === 'primary'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 shadow-sm',
        isPrimary ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-card-foreground',
        className,
      )}
    >
      {isPrimary && (
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
      )}
      <div className="relative flex items-start justify-between">
        <div>
          <p className={cn('text-sm font-medium', isPrimary ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
            {label}
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">{formatCurrency(balance)}</p>
          {subtitle && (
            <p className={cn('mt-2 text-xs', isPrimary ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    </motion.div>
  )
}
