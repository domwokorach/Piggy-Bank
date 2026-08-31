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
export async function login(identifier: string, password: string, remember: boolean): Promise<ServiceResult> {
  const nativeDevice = await getNativeDeviceInfo()

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password, nativeDevice }),
  })
  const result: (ServiceResult & { parent?: Parent }) = await response.json()
  if (!result.ok) {
    return result
  }

  const { setParent, setAuthenticated } = useBankStore.getState()
  if (result.parent) {
    setParent(result.parent)
  }
  setAuthenticated(true, remember)

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
  return response.json()
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
  return response.json()
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
