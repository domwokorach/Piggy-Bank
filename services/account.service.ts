import { useBankStore } from '@/store/bank-store'
import type { BankCard, CardStatus, Kid } from '@/types'
import type { ServiceResult } from './types'

export async function addKid(name: string, savingsTarget: number, color: string): Promise<ServiceResult & { kid?: Kid }> {
  const response = await fetch('/api/kids', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, savingsTarget, color }),
  })
  const result: ServiceResult & { kid?: Kid; card?: BankCard } = await response.json()
  if (result.ok && result.kid) {
    useBankStore.getState().addKidRecord(result.kid)
    if (result.card) useBankStore.getState().addCardRecord(result.card)
  }
  return result
}

export async function setCardStatus(cardId: string, status: CardStatus): Promise<ServiceResult> {
  const response = await fetch(`/api/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
  })
  const result: ServiceResult & { card?: BankCard } = await response.json()
  if (result.ok && result.card) useBankStore.getState().updateCard(cardId, result.card)
  return result
}
