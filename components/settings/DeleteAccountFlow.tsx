'use client'

import { type FormEvent, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  Bell,
  CheckCircle2,
  CreditCard,
  History,
  PiggyBank,
  Repeat,
  ShieldCheck,
  Target,
  User,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useAccountDeletion } from '@/hooks/useAccountDeletion'

type Step = 'warning' | 'verify' | 'confirm' | 'done'

const lostAccess = [
  { icon: User, label: 'Parent Account' },
  { icon: PiggyBank, label: 'Kids Accounts' },
  { icon: CreditCard, label: 'Cards' },
  { icon: Target, label: 'Savings targets' },
  { icon: Repeat, label: 'Transfers' },
  { icon: History, label: 'Transaction history' },
  { icon: Bell, label: 'Notifications' },
]

export function DeleteAccountFlow() {
  const router = useRouter()
  const { parent, logout } = useAuth()
  const { requestDeletion, resendPin, verifyPin, confirmDeletion, cancelDeletion } = useAccountDeletion()

  const [step, setStep] = useState<Step>('warning')
  const [pinInput, setPinInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)

  const goToSettings = () => router.push('/settings')

  const handleRequestDeletion = async () => {
    setError(null)
    setLoading(true)
    try {
      const result = await requestDeletion()
      if (!result.ok) {
        if (result.code === 'REAUTH_REQUIRED') {
          await logout()
          router.push('/login')
          return
        }
        setError(result.error ?? 'Something went wrong.')
        return
      }
      setStep('verify')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await verifyPin(pinInput)
      if (!result.ok) {
        setError(result.error ?? 'Incorrect code. Please try again.')
        return
      }
      setStep('confirm')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError(null)
    setLoading(true)
    try {
      const result = await resendPin()
      if (!result.ok) {
        setError(result.error ?? 'Could not resend the code.')
        return
      }
      setResent(true)
    } catch {
      setError('Could not resend the code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setError(null)
    setLoading(true)
    try {
      await cancelDeletion()
      goToSettings()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    setError(null)
    setLoading(true)
    try {
      const result = await confirmDeletion()
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.')
        return
      }
      setStep('done')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDone = async () => {
    await logout()
    router.push('/')
  }

  if (step === 'done') {
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
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          Your Piggy Bank account has been closed successfully.
        </h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          A confirmation email has been sent to your registered email address.
        </p>
        <Button onClick={handleDone} className="mt-7 h-11 w-full text-base">
          Return to homepage
        </Button>
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <Ban className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
          Are you sure you want to close your Piggy Bank account?
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">This action cannot be undone. You will lose access to:</p>

        <ul className="mt-4 space-y-2">
          {lostAccess.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{label}</span>
            </li>
          ))}
        </ul>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 space-y-2.5">
          <Button variant="destructive" className="h-11 w-full text-base" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Closing account…' : 'Confirm Account Closure'}
          </Button>
          <Button variant="outline" className="h-11 w-full text-base" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </>
    )
  }

  if (step === 'verify') {
    return (
      <>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Verify Account Closure</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We sent a verification code to <span className="font-medium text-foreground">{parent.email}</span>.
        </p>

        <form onSubmit={handleVerify} className="mt-7 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="deletion-pin">Verification code</Label>
            <Input
              id="deletion-pin"
              inputMode="numeric"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="h-12 text-center text-lg tracking-[0.5em]"
              required
            />
          </div>
          <Button type="submit" variant="destructive" className="h-11 w-full text-base" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify Code'}
          </Button>
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="w-full text-center text-sm font-medium text-primary hover:underline disabled:opacity-60"
          >
            Resend Code
          </button>
          {resent && (
            <p className="rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
              A new code has been sent to your email.
            </p>
          )}
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="w-full text-center text-sm font-medium text-muted-foreground hover:underline disabled:opacity-60"
          >
            Cancel Account Closure
          </button>
        </form>
      </>
    )
  }

  return (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Delete Account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Deleting your account will close your Piggy Bank profile and may remove access to linked Kids Accounts. This
        cannot be undone once fully confirmed.
      </p>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-6 space-y-2.5">
        <Button variant="destructive" className="h-11 w-full text-base" onClick={handleRequestDeletion} disabled={loading}>
          {loading ? 'Sending code…' : 'Delete My Account'}
        </Button>
        <Button variant="outline" className="h-11 w-full text-base" onClick={goToSettings} disabled={loading}>
          Go back
        </Button>
      </div>
    </>
  )
}
