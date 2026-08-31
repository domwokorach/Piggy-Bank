'use client'

import { type FormEvent, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'

export function PinVerification() {
  const router = useRouter()
  const { registrationDraft, verifyPin, resendPin, login } = useAuth()

  const [step, setStep] = useState<'verify' | 'approved'>('verify')
  const [pinInput, setPinInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sentPin, setSentPin] = useState<string | null>(null)

  useEffect(() => {
    if (!registrationDraft) {
      router.replace('/register')
    }
  }, [registrationDraft, router])

  if (!registrationDraft) return null

  const handleVerify = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const result = verifyPin(pinInput)
    if (result.ok) {
      setStep('approved')
    } else {
      setError(result.error ?? 'Incorrect PIN. Please try again.')
    }
  }

  const handleResend = () => setSentPin(resendPin())

  const handleContinue = () => {
    login(registrationDraft.username, registrationDraft.password, true)
    router.push('/personal')
  }

  if (step === 'approved') {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success"
        >
          <CheckCircle2 className="h-8 w-8" />
        </motion.div>
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">Account approved</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Welcome to Piggy Bank, {registrationDraft.firstName}. Your account is ready to use.
        </p>
        <Button onClick={handleContinue} className="mt-7 h-11 w-full text-base">
          Go to my account
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Enter your PIN</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We&apos;ve sent a 6-digit verification PIN to <span className="font-medium text-foreground">{registrationDraft.email}</span>.
      </p>

      <form onSubmit={handleVerify} className="mt-7 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="pin">Verification PIN</Label>
          <Input
            id="pin"
            inputMode="numeric"
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="h-12 text-center text-lg tracking-[0.5em]"
            required
          />
        </div>
        <Button type="submit" className="h-11 w-full text-base">
          Verify PIN
        </Button>
        <button
          type="button"
          onClick={handleResend}
          className="w-full text-center text-sm font-medium text-primary hover:underline"
        >
          Resend PIN
        </button>
        {sentPin && (
          <p className="rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
            Prototype mode — your PIN is <span className="font-semibold text-foreground">{sentPin}</span>
          </p>
        )}
      </form>
    </>
  )
}
