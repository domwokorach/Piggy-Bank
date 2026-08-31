'use client'

import { useState } from 'react'
import { AlertCircle, Check, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { AvatarCircle } from '@/components/ui/avatar-circle'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useKids } from '@/hooks/useKids'
import { useTransfers } from '@/hooks/useTransfers'
import { cn, formatCurrency } from '@/lib/utils'

type Direction = 'parentToKid' | 'kidToParent'
type Step = 'select' | 'form' | 'review' | 'success'

interface TransferFormProps {
  mode?: 'full' | 'quick'
  initialKidId?: string
  initialDirection?: Direction
}

export function TransferForm({ mode = 'full', initialKidId, initialDirection = 'parentToKid' }: TransferFormProps) {
  const { parent } = useAuth()
  const { kids } = useKids()
  const { transferParentToKid, transferKidToParent } = useTransfers()

  const [direction, setDirection] = useState<Direction>(initialDirection)
  const [kidId, setKidId] = useState<string>(initialKidId || (mode === 'full' ? kids[0]?.id ?? '' : ''))
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [step, setStep] = useState<Step>(mode === 'quick' && !initialKidId ? 'select' : 'form')
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const kid = kids.find((k) => k.id === kidId)
  const amountNumber = Number(amount)
  const fromLabel = direction === 'parentToKid' ? 'Parent Account' : kid?.name ?? 'Kid Account'
  const toLabel = direction === 'parentToKid' ? kid?.name ?? 'Kid Account' : 'Parent Account'
  const availableBalance = direction === 'parentToKid' ? parent.balance : kid?.balance ?? 0

  const handleSelect = (id: string) => {
    setKidId(id)
    setStep('form')
  }

  const handleReview = () => {
    setError(null)
    if (!kid) {
      setError('Choose a kid account.')
      return
    }
    if (!amountNumber || amountNumber <= 0) {
      setError('Enter an amount greater than £0.')
      return
    }
    if (amountNumber > availableBalance) {
      setError('This exceeds the available balance.')
      return
    }
    setStep('review')
  }

  const handleConfirm = () => {
    if (!kid) return
    setProcessing(true)
    setTimeout(() => {
      const action = direction === 'parentToKid' ? transferParentToKid : transferKidToParent
      const result = action(kid.id, amountNumber, reference || (mode === 'quick' ? 'Payment from Parent' : 'Family transfer'))
      setProcessing(false)
      if (!result.ok) {
        setError(result.error ?? 'Transfer failed. Please try again.')
        setStep('form')
        return
      }
      setStep('success')
    }, 700)
  }

  const reset = () => {
    setStep(mode === 'quick' ? 'select' : 'form')
    setKidId('')
    setAmount('')
    setReference('')
    setError(null)
  }

  if (step === 'success' && kid) {
    return (
      <div className="mx-auto max-w-sm space-y-6 py-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success"
        >
          <Check className="h-8 w-8" />
        </motion.div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {mode === 'quick' ? 'Payment sent' : 'Transfer complete'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatCurrency(amountNumber)} moved from {fromLabel} to {toLabel}.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button render={<Link href={`/kids/${kid.id}`} />} nativeButton={false} className="h-11">
            View {kid.name.split(' ')[0]}&apos;s account
          </Button>
          <Button variant="outline" className="h-11" onClick={reset}>
            {mode === 'quick' ? 'Send another payment' : 'Make another transfer'}
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'select') {
    return (
      <div className="space-y-3">
        {kids.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => handleSelect(k.id)}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted"
          >
            <AvatarCircle name={k.name} color={k.color} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{k.name}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(k.balance)}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    )
  }

  if (step === 'review' && kid) {
    return (
      <div className="max-w-md space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">Review {mode === 'quick' ? 'payment' : 'transfer'}</h2>
        <div className="divide-y divide-border rounded-xl border border-border">
          <Row label="From" value={fromLabel} />
          <Row label="To" value={toLabel} />
          <Row label="Amount" value={formatCurrency(amountNumber)} emphasis />
          <Row label="Reference" value={reference || '—'} />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-11 flex-1" onClick={() => setStep('form')} disabled={processing}>
            Back
          </Button>
          <Button className="h-11 flex-1" onClick={handleConfirm} disabled={processing}>
            {processing ? 'Confirming…' : `Confirm ${mode === 'quick' ? 'payment' : 'transfer'}`}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {mode === 'full' && (
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setDirection('parentToKid')}
            className={cn(
              'rounded-lg py-2 text-sm font-medium transition-colors',
              direction === 'parentToKid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            Parent → Kid
          </button>
          <button
            type="button"
            onClick={() => setDirection('kidToParent')}
            className={cn(
              'rounded-lg py-2 text-sm font-medium transition-colors',
              direction === 'kidToParent' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            Kid → Parent
          </button>
        </div>
      )}

      {mode === 'full' ? (
        <div className="space-y-1.5">
          <Label>Kid account</Label>
          <div className="grid gap-2">
            {kids.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKidId(k.id)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                  kidId === k.id ? 'border-primary bg-accent' : 'border-border hover:bg-muted',
                )}
              >
                <AvatarCircle name={k.name} color={k.color} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{k.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(k.balance)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        kid && (
          <div className="flex items-center gap-3">
            <AvatarCircle name={kid.name} color={kid.color} />
            <div>
              <p className="text-sm text-muted-foreground">Paying</p>
              <p className="font-medium text-foreground">{kid.name}</p>
            </div>
          </div>
        )
      )}

      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-lg text-muted-foreground">£</span>
          <Input
            id="amount"
            type="number"
            min={0}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="h-14 pl-8 text-2xl font-semibold"
          />
        </div>
        <p className="text-xs text-muted-foreground">Available balance: {formatCurrency(availableBalance)}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reference">Reference {mode === 'quick' && '(optional)'}</Label>
        <Input
          id="reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="What's this for?"
          className="h-11"
        />
      </div>

      <Button onClick={handleReview} className="h-11 w-full text-base">
        Review {mode === 'quick' ? 'payment' : 'transfer'}
      </Button>
    </div>
  )
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={emphasis ? 'text-base font-semibold text-foreground' : 'text-sm font-medium text-foreground'}>
        {value}
      </span>
    </div>
  )
}
