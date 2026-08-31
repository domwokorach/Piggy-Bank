import { useBankStore } from '@/store/bank-store'
import { validateRegistration } from '@/lib/validation'
import { pushNotification } from './notification.service'
import type { ServiceResult } from './types'
import type { RegistrationDraft } from '@/types'

/**
 * Login is still mocked on the client for this prototype. Registration and
 * PIN verification are real — they call the Next.js API routes backed by
 * Prisma/Postgres and Resend (see app/api/auth/*).
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
