import type { SensitiveAccountDetails } from '@/types'

/**
 * Mock secure reveal. In production this calls a server endpoint that
 * re-checks the session and step-up verification, then returns the PAN/CVV
 * from the card provider's vault (tokenised, never stored raw). The result
 * here is intentionally not written to the Zustand store — persist() would
 * put it in localStorage, which is never appropriate for a CVV.
 */
export async function fetchSensitiveAccountDetails(): Promise<SensitiveAccountDetails> {
  await new Promise((resolve) => setTimeout(resolve, 450))

  return {
    accountNumber: '10004821',
    sortCode: '20-45-67',
    cardNumber: '4532 9012 3456 4821',
    cardExpiry: '08/29',
    cvv: '123',
  }
}
