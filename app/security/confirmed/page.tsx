'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertTriangle, CheckCircle2, ShieldCheck, ShieldOff } from 'lucide-react'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'

const content: Record<string, { icon: typeof CheckCircle2; title: string; description: string; tone: string }> = {
  confirmed: {
    icon: ShieldCheck,
    title: "Thanks, we've marked this device as trusted",
    description: 'You won’t be asked to confirm logins from this device again.',
    tone: 'text-success bg-success/10',
  },
  'already-confirmed': {
    icon: CheckCircle2,
    title: 'This login was already confirmed',
    description: 'No further action is needed.',
    tone: 'text-success bg-success/10',
  },
  blocked: {
    icon: ShieldOff,
    title: "Your account has been secured",
    description:
      'We signed out the suspicious session and any other active sessions, blocked the device, and sent you a confirmation email. Please reset your password before logging in again.',
    tone: 'text-destructive bg-destructive/10',
  },
  'already-blocked': {
    icon: ShieldOff,
    title: 'This login was already secured',
    description: 'Your account was already secured in response to this login. Reset your password if you haven’t already.',
    tone: 'text-destructive bg-destructive/10',
  },
  invalid: {
    icon: AlertTriangle,
    title: 'This link is invalid or has expired',
    description: 'Security confirmation links expire after 3 days. If you still have concerns about your account, please log in and check Settings → Security → Devices.',
    tone: 'text-muted-foreground bg-muted',
  },
}

function ConfirmedContent() {
  const searchParams = useSearchParams()
  const result = searchParams.get('result') ?? 'invalid'
  const entry = content[result] ?? content.invalid
  const Icon = entry.icon

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full ${entry.tone}`}>
        <Icon className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">{entry.title}</h1>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{entry.description}</p>
      <Button render={<Link href={result === 'blocked' ? '/forgot-password' : '/login'} />} nativeButton={false} className="mt-7 h-11 w-full text-base">
        {result === 'blocked' ? 'Reset password' : 'Go to login'}
      </Button>
    </div>
  )
}

export default function SecurityConfirmedPage() {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <ConfirmedContent />
      </Suspense>
    </AuthLayout>
  )
}
