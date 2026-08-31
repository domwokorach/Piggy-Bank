import { hydrateBankingData } from './banking.service'
import type { ServiceResult } from './types'

type TransferResult = ServiceResult & { transactionNumber?: string }

async function transfer(direction: 'parentToKid' | 'kidToParent', kidId: string, amount: number, reference: string): Promise<TransferResult> {
  const response = await fetch('/api/transfers', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ direction, kidId, amount, reference }),
  })
  const result = (await response.json()) as ServiceResult & { transaction?: { transactionNumber: string } }
  if (!result.ok) return result
  await hydrateBankingData()
  return { ok: true, transactionNumber: result.transaction?.transactionNumber }
}

export function transferParentToKid(kidId: string, amount: number, reference: string) {
  return transfer('parentToKid', kidId, amount, reference)
}

export function transferKidToParent(kidId: string, amount: number, reference: string) {
  return transfer('kidToParent', kidId, amount, reference)
}
