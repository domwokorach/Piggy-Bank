import { useBankStore } from '@/store/bank-store'
import { generatePin } from '@/lib/utils'
import { isSixDigitPin, validateRegistration } from '@/lib/validation'
import { pushNotification } from './notification.service'
import type { ServiceResult } from './types'
import type { RegistrationDraft } from '@/types'

/**
 * Auth is mocked entirely on the client for this prototype. In production
 * this module is where the real API/session calls would live — the
 * signatures below are already shaped for that swap.
 */
export function login(identifier: string, password: string, remember: boolean): ServiceResult {
  const { parent, setAuthenticated } = useBankStore.getState()

  const matches =
    identifier.trim().toLowerCase() === parent.username.toLowerCase() ||
    identifier.trim().toLowerCase() === parent.email.toLowerCase()

  if (!matches) {
    return { ok: false, error: 'We could not find an account with those details.' }
  }
  if (password.length < 4) {
    return { ok: false, error: 'Incorrect password. Please try again.' }
  }
  if (parent.status !== 'active') {
    return { ok: false, error: 'Your account is still pending approval.' }
  }

  setAuthenticated(true, remember)
  return { ok: true }
}

export function logout(): void {
  useBankStore.getState().setAuthenticated(false)
}

export function registerParent(draft: RegistrationDraft, confirmPassword: string): ServiceResult & { pin?: string } {
  const validationError = validateRegistration({ ...draft, confirmPassword })
  if (validationError) {
    return { ok: false, error: validationError }
  }

  const { setParent, setRegistrationDraft, setPendingPin } = useBankStore.getState()
  const pin = generatePin()

  setRegistrationDraft(draft)
  setPendingPin(pin)
  setParent({
    firstName: draft.firstName,
    lastName: draft.lastName,
    dob: draft.dob,
    mobile: draft.mobile,
    email: draft.email,
    username: draft.username,
    avatarUrl: draft.avatarUrl,
    status: 'pending',
  })

  // Mock email delivery — a real backend would send this via an email provider.
  console.info(`[Piggy Bank] Verification PIN sent to ${draft.email}: ${pin}`)

  return { ok: true, pin }
}

export function resendPin(): string {
  const pin = generatePin()
  useBankStore.getState().setPendingPin(pin)
  console.info(`[Piggy Bank] Verification PIN resent: ${pin}`)
  return pin
}

export function verifyPin(pin: string): ServiceResult {
  if (!isSixDigitPin(pin)) {
    return { ok: false, error: 'Enter the 6-digit PIN from your email.' }
  }

  const { pendingPin, parent, setParent, setPendingPin } = useBankStore.getState()
  if (pin !== pendingPin) {
    return { ok: false, error: 'Incorrect PIN. Please check your email and try again.' }
  }

  setParent({ status: 'active' })
  setPendingPin(null)

  pushNotification(
    'account_approved',
    'Account approved',
    `Welcome ${parent.firstName}! Your Piggy Bank account is ready to use.`,
  )

  return { ok: true }
}
