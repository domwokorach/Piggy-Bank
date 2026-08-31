import type { Transaction, TransactionStatus, TransactionType } from '@/prisma/generated/client'

export type ClientTransactionType = 'payment' | 'transfer' | 'deposit' | 'spend' | 'savings'
export type ClientTransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed'

const typeToClient: Record<TransactionType, ClientTransactionType> = {
  PAYMENT: 'payment',
  TRANSFER: 'transfer',
  DEPOSIT: 'deposit',
  SPEND: 'spend',
  SAVINGS: 'savings',
}

const statusToClient: Record<TransactionStatus, ClientTransactionStatus> = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REVERSED: 'reversed',
}

export function toPublicTransaction(transaction: Transaction) {
  return {
    transactionNumber: transaction.transactionNumber,
    type: typeToClient[transaction.type],
    status: statusToClient[transaction.status],
    amount: Number(transaction.amount),
    fromLabel: transaction.fromLabel,
    toLabel: transaction.toLabel,
    fromAccountId: transaction.fromAccountId ?? undefined,
    toAccountId: transaction.toAccountId ?? undefined,
    reference: transaction.reference ?? undefined,
    category: transaction.category ?? undefined,
    createdAt: transaction.createdAt.toISOString(),
    completedAt: transaction.completedAt?.toISOString(),
  }
}

export type PublicTransaction = ReturnType<typeof toPublicTransaction>
