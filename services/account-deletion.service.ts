import { useBankStore } from '@/store/bank-store'
import { pushNotification } from './notification.service'
import type { ServiceResult } from './types'

async function post(path: string, body?: unknown): Promise<ServiceResult> {
  const response = await fetch(path, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  return response.json()
}

export async function requestAccountDeletion(): Promise<ServiceResult> {
  const result = await post('/api/account/delete/request')
  if (result.ok) {
    useBankStore.getState().setParent({ status: 'pending_closure' })
    pushNotification(
      'account_closure_requested',
      'Account closure requested',
      'We sent a verification code to your registered email to confirm closing your account.',
    )
  }
  return result
}

export async function resendDeletionPin(): Promise<ServiceResult> {
  return post('/api/account/delete/resend')
}

export async function verifyDeletionPin(pin: string): Promise<ServiceResult> {
  return post('/api/account/delete/verify', { pin })
}

export async function confirmAccountDeletion(): Promise<ServiceResult> {
  const result = await post('/api/account/delete/confirm')
  if (result.ok) {
    const { parent, setParent } = useBankStore.getState()
    setParent({ status: 'closed' })
    pushNotification('account_closed', 'Account closed', `${parent.firstName}, your Piggy Bank account has been closed.`)
    // The server has already revoked the session and cleared the cookie.
    // isAuthenticated is left true here so the success screen (rendered
    // inside the authed dashboard layout) can still display — the caller
    // flips it via logout() once the user leaves the screen.
  }
  return result
}

export async function cancelAccountDeletion(): Promise<ServiceResult> {
  const result = await post('/api/account/delete/cancel')
  if (result.ok) {
    useBankStore.getState().setParent({ status: 'active' })
    pushNotification(
      'account_closure_cancelled',
      'Account closure cancelled',
      'Your account closure request was cancelled. Your account remains active.',
    )
  }
  return result
}
