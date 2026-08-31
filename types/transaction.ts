export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed'

export interface Transaction {
  id: string
  accountId: string // parent id or kid id
  type: 'payment' | 'transfer' | 'deposit' | 'spend' | 'savings'
  direction: 'in' | 'out'
  amount: number
  counterparty: string
  reference?: string
  category?: string
  date: string // ISO
  // Server-generated, permanent public reference (e.g. PB-20260831-8F3K2A).
  // Both legs of a transfer share the same number and point at one real row
  // in the Postgres `transactions` table (see lib/transactions.ts).
  transactionNumber: string
  status: TransactionStatus
}

export interface MonthlyActivity {
  month: string
  toKids: number
  received: number
  savings: number
  spending: number
}
