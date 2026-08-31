'use client'

import { useCallback } from 'react'
import * as accountService from '@/services/account.service'
import { useBankStore } from '@/store/bank-store'
import type { CardStatus } from '@/types'

export function useKids() {
  const kids = useBankStore((s) => s.kids)
  const cards = useBankStore((s) => s.cards)

  const getKid = useCallback((kidId: string) => kids.find((k) => k.id === kidId), [kids])
  const getCardForKid = useCallback((kidId: string) => cards.find((c) => c.ownerKidId === kidId), [cards])
  const getCard = useCallback((cardId: string) => cards.find((c) => c.id === cardId), [cards])

  const addKid = useCallback(
    (name: string, savingsTarget: number, color: string) => accountService.addKid(name, savingsTarget, color),
    [],
  )

  const setCardStatus = useCallback(
    (cardId: string, status: CardStatus) => accountService.setCardStatus(cardId, status),
    [],
  )

  return { kids, cards, getKid, getCardForKid, getCard, addKid, setCardStatus }
}
