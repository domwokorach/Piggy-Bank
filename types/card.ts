export type CardStatus = 'active' | 'frozen' | 'locked'

export type CardDesign = 'navy' | 'midnight' | 'sky' | 'slate'

export interface BankCard {
  id: string
  ownerKidId: string
  cardholderName: string
  last4: string
  expiry: string
  design: CardDesign
  status: CardStatus
}
