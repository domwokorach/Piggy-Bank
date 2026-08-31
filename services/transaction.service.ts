import type { Transaction } from '@/types'

export interface CreateTransactionParams {
  type: Transaction['type']
  status?: Transaction['status']
  amount: number
  fromLabel: string
  toLabel: string
  fromAccountId?: string
  toAccountId?: string
  reference?: string
  category?: string
}

export interface RemoteTransaction {
  transactionNumber: string
  type: Transaction['type']
  status: Transaction['status']
  amount: number
  fromLabel: string
  toLabel: string
  fromAccountId?: string
  toAccountId?: string
  reference?: string
  category?: string
  createdAt: string
  completedAt?: string
}

export async function createTransaction(
  params: CreateTransactionParams,
): Promise<{ ok: true; transaction: RemoteTransaction } | { ok: false; error: string }> {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return response.json()
}

export async function fetchTransaction(
  transactionNumber: string,
): Promise<{ ok: true; transaction: RemoteTransaction } | { ok: false; error: string }> {
  const response = await fetch(`/api/transactions/${encodeURIComponent(transactionNumber)}`)
  return response.json()
}
