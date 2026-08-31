import { useBankStore } from '@/store/bank-store'
import { generateId } from '@/lib/utils'
import { pushNotification } from './notification.service'
import type { BankCard, CardStatus, Kid } from '@/types'

export function addKid(name: string, savingsTarget: number, color: string): Kid {
  const { parent, addKidRecord, addCardRecord } = useBankStore.getState()

  const kidId = generateId('kid')
  const cardId = generateId('card')

  const kid: Kid = {
    id: kidId,
    parentId: parent.id,
    name,
    color,
    balance: 0,
    savingsTarget,
    savingsProgress: 0,
    cardId,
  }

  const card: BankCard = {
    id: cardId,
    ownerKidId: kidId,
    cardholderName: name,
    last4: Math.floor(1000 + Math.random() * 9000).toString(),
    expiry: '12/30',
    design: 'navy',
    status: 'active',
  }

  addKidRecord(kid)
  addCardRecord(card)

  pushNotification('new_kid_account', 'Kid account created', `${name} was added to your family account.`)

  return kid
}

export function setCardStatus(cardId: string, status: CardStatus): void {
  const { cards, updateCard } = useBankStore.getState()
  const card = cards.find((c) => c.id === cardId)
  if (!card) return

  updateCard(cardId, { status })

  if (status === 'frozen') {
    pushNotification('card_frozen', 'Card frozen', `${card.cardholderName}'s card was frozen. Spending is disabled.`)
  } else if (status === 'active') {
    pushNotification('card_unlocked', 'Card unlocked', `${card.cardholderName}'s card is now active.`)
  }
}
