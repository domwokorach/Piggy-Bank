import type { SensitiveAccountDetails } from '@/types'

export async function fetchSensitiveAccountDetails(): Promise<SensitiveAccountDetails> {
  const response = await fetch('/api/accounts/details', { cache: 'no-store' })
  const result = (await response.json()) as { ok: boolean; details?: SensitiveAccountDetails; error?: string }
  if (!result.ok || !result.details) throw new Error(result.error ?? 'Could not load account details.')
  return result.details
}
