'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Copy, CopyCheck, Eye, EyeOff } from 'lucide-react'
import { ConfirmPinDialog } from './ConfirmPinDialog'
import { fetchSensitiveAccountDetails } from '@/services/account-security.service'
import { pushNotification } from '@/services/notification.service'
import type { Parent, SensitiveAccountDetails } from '@/types'

const AUTO_HIDE_MS = 30_000

interface AccountCardDetailsProps {
  parent: Parent
}

export function AccountCardDetails({ parent }: AccountCardDetailsProps) {
  const [pinDialogOpen, setPinDialogOpen] = useState(false)
  const [details, setDetails] = useState<SensitiveAccountDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const revealed = details !== null

  const clearHideTimer = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }

  const hide = () => {
    clearHideTimer()
    setDetails(null)
  }

  // Auto-hide after a short window, and whenever the tab/app loses focus or
  // is backgrounded — sensitive fields should never sit revealed unattended.
  useEffect(() => {
    if (!revealed) return undefined
    hideTimer.current = setTimeout(hide, AUTO_HIDE_MS)
    return clearHideTimer
  }, [revealed])

  useEffect(() => {
    const hideIfBackgrounded = () => {
      if (document.visibilityState === 'hidden') hide()
    }
    document.addEventListener('visibilitychange', hideIfBackgrounded)
    window.addEventListener('blur', hideIfBackgrounded)
    return () => {
      document.removeEventListener('visibilitychange', hideIfBackgrounded)
      window.removeEventListener('blur', hideIfBackgrounded)
    }
  }, [])

  useEffect(() => clearHideTimer, [])

  const handleToggle = () => {
    if (revealed) {
      hide()
      return
    }
    setPinDialogOpen(true)
  }

  const handlePinVerified = async () => {
    setPinDialogOpen(false)
    setLoading(true)
    try {
      const result = await fetchSensitiveAccountDetails()
      setDetails(result)
      pushNotification(
        'card_details_viewed',
        'Account details viewed',
        'Your card and account details were revealed on this device.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 2000)
    } catch {
      // clipboard access denied — ignore, the value is already visible on screen
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Account &amp; card details</h2>
        <motion.button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 text-sm font-medium text-primary disabled:opacity-60"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={revealed ? 'hide' : 'show'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {loading ? 'Verifying…' : revealed ? 'Hide details' : 'Show details'}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="mt-3 divide-y divide-border rounded-xl border border-border">
        <DetailRow
          label="Card Number"
          maskedValue={`•••• •••• •••• ${parent.cardLast4}`}
          value={details?.cardNumber}
          revealed={revealed}
          copyField="cardNumber"
          copiedField={copiedField}
          onCopy={handleCopy}
        />
        <DetailRow
          label="Sort Code"
          maskedValue="••-••-••"
          value={details?.sortCode}
          revealed={revealed}
          copyField="sortCode"
          copiedField={copiedField}
          onCopy={handleCopy}
        />
        <DetailRow
          label="Account Number"
          maskedValue={`••••${parent.accountNumberLast4}`}
          value={details?.accountNumber}
          revealed={revealed}
          copyField="accountNumber"
          copiedField={copiedField}
          onCopy={handleCopy}
        />
        <DetailRow label="CVV" maskedValue="•••" value={details?.cvv} revealed={revealed} />
        <DetailRow label="Expiry Date" maskedValue="••/••" value={details?.cardExpiry} revealed={revealed} />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Details hide automatically after a short time or if you leave this screen.
      </p>

      <ConfirmPinDialog open={pinDialogOpen} onOpenChange={setPinDialogOpen} onVerified={handlePinVerified} />
    </section>
  )
}

interface DetailRowProps {
  label: string
  maskedValue: string
  value?: string
  revealed: boolean
  copyField?: string
  copiedField?: string | null
  onCopy?: (field: string, value: string) => void
}

function DetailRow({ label, maskedValue, value, revealed, copyField, copiedField, onCopy }: DetailRowProps) {
  const displayValue = revealed && value ? value : maskedValue
  const isCopied = copyField !== undefined && copiedField === copyField

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={revealed ? 'revealed' : 'masked'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="font-mono text-sm font-medium tabular-nums text-foreground"
          >
            {displayValue}
          </motion.span>
        </AnimatePresence>
        {copyField && revealed && value && onCopy && (
          <button
            type="button"
            onClick={() => onCopy(copyField, value)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            aria-label={`Copy ${label}`}
          >
            {isCopied ? (
              <>
                <CopyCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary">Copied to clipboard</span>
              </>
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
