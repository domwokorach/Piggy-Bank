'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSecurityPin } from '@/hooks/useSecurityPin'

interface ConfirmPinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified: () => void
}

type Step = 'create' | 'confirm' | 'verify'

const copy: Record<Step, { title: string; description: string }> = {
  create: {
    title: 'Create a security PIN',
    description: 'Choose a 4-digit PIN. You’ll use this same PIN every time you reveal sensitive details.',
  },
  confirm: {
    title: 'Confirm your PIN',
    description: 'Re-enter your PIN to confirm it.',
  },
  verify: {
    title: 'Confirm it’s you',
    description: 'Enter your PIN to reveal your card and account details.',
  },
}

export function ConfirmPinDialog({ open, onOpenChange, onVerified }: ConfirmPinDialogProps) {
  const { hasPin, createPin, verifyPin } = useSecurityPin()

  const [step, setStep] = useState<Step>('verify')
  const [pin, setPin] = useState('')
  const [pendingPin, setPendingPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (open) {
      setStep(hasPin ? 'verify' : 'create')
      setPin('')
      setPendingPin('')
      setError(null)
      setVerifying(false)
    }
    // Only re-derive the starting step when the dialog opens, not on every
    // hasPin change (e.g. once createPin resolves mid-flow).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
  }

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError('Enter a 4-digit PIN.')
      return
    }

    if (step === 'create') {
      setPendingPin(pin)
      setPin('')
      setError(null)
      setStep('confirm')
      return
    }

    if (step === 'confirm') {
      if (pin !== pendingPin) {
        setError('PINs don’t match. Start again.')
        setPendingPin('')
        setPin('')
        setStep('create')
        return
      }
      setVerifying(true)
      await createPin(pin)
      setVerifying(false)
      onVerified()
      return
    }

    // verify
    setVerifying(true)
    setError(null)
    const correct = await verifyPin(pin)
    setVerifying(false)
    if (!correct) {
      setError('Incorrect PIN. Try again.')
      setPin('')
      return
    }
    onVerified()
  }

  const { title, description } = copy[step]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Input
          autoFocus
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="••••"
          aria-label="4-digit PIN"
          className="h-11 text-center text-lg tracking-[0.6em]"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={verifying}>
            {verifying ? 'Verifying…' : step === 'create' ? 'Continue' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
