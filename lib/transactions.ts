import { prisma } from '@/lib/prisma'
import { generateTransactionNumber } from '@/lib/transaction-number'
import { Prisma, type Transaction, type TransactionStatus, type TransactionType } from '@/prisma/generated/client'

const MAX_GENERATION_ATTEMPTS = 5

export type ClientTransactionType = 'payment' | 'transfer' | 'deposit' | 'spend' | 'savings'
export type ClientTransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed'

export interface CreateTransactionInput {
  userId: string
  type: TransactionType
  status?: TransactionStatus
  amount: number
  fromLabel: string
  toLabel: string
  fromAccountId?: string
  toAccountId?: string
  reference?: string
  category?: string
}

export async function createTransactionRecord(input: CreateTransactionInput): Promise<Transaction> {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const transactionNumber = generateTransactionNumber()
    try {
      return await prisma.transaction.create({
        data: {
          transactionNumber,
          userId: input.userId,
          type: input.type,
          status: input.status ?? 'COMPLETED',
          amount: input.amount,
          fromLabel: input.fromLabel,
          toLabel: input.toLabel,
          fromAccountId: input.fromAccountId,
          toAccountId: input.toAccountId,
          reference: input.reference,
          category: input.category,
          completedAt: (input.status ?? 'COMPLETED') === 'COMPLETED' ? new Date() : null,
        },
      })
    } catch (error) {
      const isCollision = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
      if (!isCollision || attempt === MAX_GENERATION_ATTEMPTS - 1) {
        throw error
      }
    }
  }
  throw new Error('Failed to generate a unique transaction number.')
}

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

const typeFromClient: Record<ClientTransactionType, TransactionType> = {
  payment: 'PAYMENT',
  transfer: 'TRANSFER',
  deposit: 'DEPOSIT',
  spend: 'SPEND',
  savings: 'SAVINGS',
}

const statusFromClient: Record<ClientTransactionStatus, TransactionStatus> = {
  pending: 'PENDING',
  processing: 'PROCESSING',
  completed: 'COMPLETED',
  failed: 'FAILED',
  cancelled: 'CANCELLED',
  reversed: 'REVERSED',
}

export function parseClientType(value: unknown): TransactionType | null {
  if (typeof value !== 'string') return null
  return typeFromClient[value as ClientTransactionType] ?? null
}

export function parseClientStatus(value: unknown): TransactionStatus | null {
  if (typeof value !== 'string') return null
  return statusFromClient[value as ClientTransactionStatus] ?? null
}

export function toPublicTransaction(transaction: Transaction) {
  return {
    transactionNumber: transaction.transactionNumber,
    type: typeToClient[transaction.type],
    status: statusToClient[transaction.status],
    amount: transaction.amount,
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
