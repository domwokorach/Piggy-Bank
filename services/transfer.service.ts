import { useBankStore } from '@/store/bank-store'
import { generateId } from '@/lib/utils'
import { isPositiveAmount } from '@/lib/validation'
import { createTransaction } from './transaction.service'
import { pushNotification } from './notification.service'
import type { ServiceResult } from './types'
import type { Transaction } from '@/types'

type TransferResult = ServiceResult & { transactionNumber?: string }

export async function transferParentToKid(kidId: string, amount: number, reference: string): Promise<TransferResult> {
  const { parent, kids, updateKid, setParent, addTransactions } = useBankStore.getState()

  if (!isPositiveAmount(amount)) {
    return { ok: false, error: 'Enter an amount greater than £0.' }
  }
  if (amount > parent.balance) {
    pushNotification('transfer_failed', 'Transfer failed', `Payment of £${amount.toFixed(2)} failed — insufficient balance.`)
    return { ok: false, error: 'This exceeds your available balance.' }
  }

  const kid = kids.find((k) => k.id === kidId)
  if (!kid) return { ok: false, error: 'Kid account not found.' }

  const result = await createTransaction({
    type: 'payment',
    amount,
    fromLabel: 'Parent Account',
    toLabel: kid.name,
    fromAccountId: parent.id,
    toAccountId: kidId,
    reference,
  })
  if (!result.ok) {
    pushNotification('transfer_failed', 'Transfer failed', `Payment of £${amount.toFixed(2)} to ${kid.name} could not be completed.`)
    return { ok: false, error: result.error }
  }

  const { transactionNumber, status, createdAt } = result.transaction
  const newKidBalance = +(kid.balance + amount).toFixed(2)

  setParent({ balance: +(parent.balance - amount).toFixed(2) })
  updateKid(kidId, {
    balance: newKidBalance,
    savingsProgress: Math.min(kid.savingsTarget, newKidBalance),
  })

  const transactions: Transaction[] = [
    {
      id: generateId('txn'),
      accountId: parent.id,
      type: 'transfer',
      direction: 'out',
      amount,
      counterparty: kid.name,
      reference,
      date: createdAt,
      transactionNumber,
      status,
    },
    {
      id: generateId('txn'),
      accountId: kidId,
      type: 'payment',
      direction: 'in',
      amount,
      counterparty: 'Parent Account',
      reference,
      date: createdAt,
      transactionNumber,
      status,
    },
  ]
  addTransactions(transactions)

  pushNotification(
    'payment_received',
    'Payment received',
    `${kid.name} received £${amount.toFixed(2)} from Parent Account.`,
    { actionLabel: 'View Transaction', actionHref: `/transactions/${transactionNumber}` },
  )

  if (newKidBalance >= kid.savingsTarget && kid.savingsProgress < kid.savingsTarget) {
    pushNotification(
      'savings_target_reached',
      'Savings target reached',
      `${kid.name} reached their £${kid.savingsTarget.toFixed(2)} savings target!`,
    )
  }

  return { ok: true, transactionNumber }
}

export async function transferKidToParent(kidId: string, amount: number, reference: string): Promise<TransferResult> {
  const { parent, kids, updateKid, setParent, addTransactions } = useBankStore.getState()

  const kid = kids.find((k) => k.id === kidId)
  if (!kid) return { ok: false, error: 'Kid account not found.' }

  if (!isPositiveAmount(amount)) {
    return { ok: false, error: 'Enter an amount greater than £0.' }
  }
  if (amount > kid.balance) {
    pushNotification(
      'transfer_failed',
      'Transfer failed',
      `Transfer of £${amount.toFixed(2)} from ${kid.name} failed — insufficient balance.`,
    )
    return { ok: false, error: `This exceeds ${kid.name}'s available balance.` }
  }

  const result = await createTransaction({
    type: 'transfer',
    amount,
    fromLabel: kid.name,
    toLabel: 'Parent Account',
    fromAccountId: kidId,
    toAccountId: parent.id,
    reference,
  })
  if (!result.ok) {
    pushNotification('transfer_failed', 'Transfer failed', `Transfer of £${amount.toFixed(2)} from ${kid.name} could not be completed.`)
    return { ok: false, error: result.error }
  }

  const { transactionNumber, status, createdAt } = result.transaction
  const newKidBalance = +(kid.balance - amount).toFixed(2)

  setParent({ balance: +(parent.balance + amount).toFixed(2) })
  updateKid(kidId, {
    balance: newKidBalance,
    savingsProgress: Math.min(kid.savingsTarget, newKidBalance),
  })

  const transactions: Transaction[] = [
    {
      id: generateId('txn'),
      accountId: parent.id,
      type: 'transfer',
      direction: 'in',
      amount,
      counterparty: kid.name,
      reference,
      date: createdAt,
      transactionNumber,
      status,
    },
    {
      id: generateId('txn'),
      accountId: kidId,
      type: 'transfer',
      direction: 'out',
      amount,
      counterparty: 'Parent Account',
      reference,
      date: createdAt,
      transactionNumber,
      status,
    },
  ]
  addTransactions(transactions)

  pushNotification(
    'transfer_completed',
    'Transfer completed',
    `${kid.name} sent £${amount.toFixed(2)} back to Parent Account.`,
    { actionLabel: 'View Transaction', actionHref: `/transactions/${transactionNumber}` },
  )

  return { ok: true, transactionNumber }
}
