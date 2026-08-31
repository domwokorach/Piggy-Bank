'use client'

import { type FormEvent, Suspense, useState } from 'react'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'

type Step = 'request' | 'reset' | 'done'

function ForgotPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { requestPasswordReset, resetPassword } = useAuth()

  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [pin, setPin] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setStep('reset')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await resetPassword(email, pin, newPassword)
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

  if (step === 'done') {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">Password reset</h1>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Your password has been changed. You&apos;ve been signed out everywhere — log in again with your new password.
          </p>
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            className="mt-7 h-11 w-full text-base"
            onClick={() => router.push('/login')}
          >
            Back to login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  if (step === 'reset') {
    return (
      <AuthLayout>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Reset your password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{email}</span>, we&apos;ve sent a
          6-digit code. Enter it below with your new password.
        </p>

        <form onSubmit={handleReset} className="mt-7 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="reset-pin">Verification code</Label>
            <Input
              id="reset-pin"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="h-12 text-center text-lg tracking-[0.5em]"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 pr-11"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset password'}
          </Button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Mail className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Forgot your password?</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Enter the email linked to your account and we&apos;ll send you a reset code.
      </p>

      <form onSubmit={handleRequest} className="mt-7 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11"
            required
          />
        </div>
        <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset code'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
