'use client'

import { useCallback, useMemo } from 'react'
import * as transferService from '@/services/transfer.service'
import { useBankStore } from '@/store/bank-store'

export function useTransfers() {
  const transactions = useBankStore((s) => s.transactions)
  const parent = useBankStore((s) => s.parent)
  const monthlyActivity = useBankStore((s) => s.monthlyActivity)

  const getTransactionsForAccount = useCallback(
    (accountId: string | undefined) => transactions.filter((t) => t.accountId === accountId),
    [transactions],
  )

  const recentParentTransactions = useMemo(
    () => transactions.filter((t) => t.accountId === parent.id).slice(0, 5),
    [transactions, parent.id],
  )

  const transferParentToKid = useCallback(
    (kidId: string, amount: number, reference: string) => transferService.transferParentToKid(kidId, amount, reference),
    [],
  )

  const transferKidToParent = useCallback(
    (kidId: string, amount: number, reference: string) => transferService.transferKidToParent(kidId, amount, reference),
    [],
  )

  return {
    transactions,
    monthlyActivity,
    getTransactionsForAccount,
    recentParentTransactions,
    transferParentToKid,
    transferKidToParent,
  }
}
