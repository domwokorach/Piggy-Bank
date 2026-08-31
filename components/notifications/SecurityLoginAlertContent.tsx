'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import type { SecurityLoginAlert } from '@/types'

interface SecurityLoginAlertContentProps {
  security: SecurityLoginAlert
  onResolved: () => void
}

/**
 * Shared "Yes, it was me" / "Secure Account" body for a new/suspicious login
 * alert — rendered inline in a toast on desktop/tablet, and inside a bottom
 * sheet on mobile (see NotificationCenter).
 */
export function SecurityLoginAlertContent({ security, onResolved }: SecurityLoginAlertContentProps) {
  const router = useRouter()
  const { logout } = useAuth()

  const [busy, setBusy] = useState<'confirm' | 'block' | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const runAction = async (action: 'confirm' | 'block') => {
    setBusy(action)
    try {
      const url = action === 'confirm' ? security.confirmUrl : security.blockUrl
      const response = await fetch(url)
      const outcome = new URL(response.url).searchParams.get('result')
      setResult(outcome)

      if (action === 'block') {
        await logout()
        router.push('/forgot-password')
        return
      }

      setTimeout(onResolved, 2000)
    } catch {
      setResult('invalid')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="space-y-0.5 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        <p>{security.deviceLabel}</p>
        <p>{security.location}</p>
        <p>{security.dateTime}</p>
      </div>

      {!result && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => runAction('confirm')} disabled={busy !== null}>
            {busy === 'confirm' ? 'Confirming…' : 'Yes, it was me'}
          </Button>
          <Button size="sm" variant="destructive" onClick={() => runAction('block')} disabled={busy !== null}>
            {busy === 'block' ? 'Securing…' : 'Secure Account'}
          </Button>
        </div>
      )}

      {result === 'confirmed' && <p className="mt-2 text-xs font-medium text-success">Device marked as trusted.</p>}
      {result === 'invalid' && (
        <p className="mt-2 text-xs font-medium text-destructive">
          Something went wrong. Please check Settings → Security → Devices.
        </p>
      )}
    </div>
  )
}
