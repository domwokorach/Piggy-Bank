import { useBankStore } from '@/store/bank-store'
import { validateRegistration } from '@/lib/validation'
import { getNativeDeviceInfo } from '@/lib/native-device'
import { pushNotification } from './notification.service'
import type { ServiceResult } from './types'
import type { Parent, RegistrationDraft } from '@/types'

/**
 * Login and registration call the Next.js API routes backed by
 * Prisma/Postgres, Resend, and a signed session cookie (see app/api/auth/*).
 */
interface LoginSecurityAlert {
  isSuspicious: boolean
  deviceLabel: string
  location: string
  dateTime: string
  confirmUrl: string
  blockUrl: string
}

export async function login(identifier: string, password: string, remember: boolean): Promise<ServiceResult> {
  const nativeDevice = await getNativeDeviceInfo()

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password, nativeDevice }),
  })
  const result: ServiceResult & { parent?: Parent; security?: LoginSecurityAlert } = await response.json()
  if (!result.ok) {
    if (result.code === 'RESET_REQUIRED') {
      pushNotification(
        'account_locked',
        'Account locked',
        'Your account was locked for security reasons. Reset your password to regain access.',
      )
    }
    return result
  }

  const { setParent, setAuthenticated } = useBankStore.getState()
  if (result.parent) {
    setParent(result.parent)
  }
  setAuthenticated(true, remember)

  if (result.security) {
    const { isSuspicious, deviceLabel, location, dateTime, confirmUrl, blockUrl } = result.security
    pushNotification(
      isSuspicious ? 'suspicious_login' : 'new_login',
      isSuspicious ? 'Suspicious login detected' : 'New login detected',
      `A login was detected from ${deviceLabel} in ${location}.`,
      { security: { deviceLabel: `${deviceLabel}`, location, dateTime, confirmUrl, blockUrl } },
    )
  }

  return { ok: true }
}

export async function requestPasswordReset(email: string): Promise<ServiceResult> {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return response.json()
}

export async function resetPassword(email: string, pin: string, newPassword: string): Promise<ServiceResult> {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, pin, newPassword }),
  })
  const result: ServiceResult = await response.json()
  if (result.ok) {
    pushNotification('account_unlocked', 'Account unlocked', 'Your password was reset and your account is unlocked.')
  }
  return result
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
  useBankStore.getState().setAuthenticated(false)
}

export async function registerParent(draft: RegistrationDraft, confirmPassword: string): Promise<ServiceResult> {
  const validationError = validateRegistration({ ...draft, confirmPassword })
  if (validationError) {
    return { ok: false, error: validationError }
  }

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...draft, confirmPassword }),
  })
  const result: ServiceResult = await response.json()
  if (!result.ok) {
    return result
  }

  const { setParent, setRegistrationDraft } = useBankStore.getState()
  setRegistrationDraft(draft)
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

  pushNotification('pin_verification', 'Verification PIN sent', `We sent a 6-digit code to ${draft.email}.`)

  return { ok: true }
}

export async function resendPin(): Promise<ServiceResult> {
  const { registrationDraft } = useBankStore.getState()
  if (!registrationDraft) {
    return { ok: false, error: 'Start your registration again.' }
  }

  const response = await fetch('/api/auth/resend-pin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: registrationDraft.email }),
  })
  const result: ServiceResult = await response.json()
  if (result.ok) {
    pushNotification('pin_verification', 'Verification PIN sent', `A new code was sent to ${registrationDraft.email}.`)
  }
  return result
}

export async function verifyPin(pin: string): Promise<ServiceResult> {
  const { registrationDraft, parent, setParent } = useBankStore.getState()
  if (!registrationDraft) {
    return { ok: false, error: 'Start your registration again.' }
  }

  const response = await fetch('/api/auth/verify-pin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: registrationDraft.email, pin }),
  })
  const result: ServiceResult = await response.json()
  if (!result.ok) {
    return result
  }

  setParent({ status: 'active' })

  pushNotification(
    'account_approved',
    'Account approved',
    `Welcome ${parent.firstName}! Your Piggy Bank account is ready to use.`,
  )

  return { ok: true }
}
