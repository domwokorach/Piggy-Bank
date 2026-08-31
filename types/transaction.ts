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
}

export interface MonthlyActivity {
  month: string
  toKids: number
  received: number
  savings: number
  spending: number
}
