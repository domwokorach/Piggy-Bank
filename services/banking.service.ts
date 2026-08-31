import { useBankStore } from '@/store/bank-store'
import type { AppNotification, BankCard, Kid, Parent, Transaction } from '@/types'
import type { RemoteTransaction } from './transaction.service'

function toStoreTransactions(rows: RemoteTransaction[]): Transaction[] {
  return rows.flatMap((row) => {
    const base = {
      id: row.transactionNumber,
      type: row.type,
      amount: row.amount,
      reference: row.reference,
      date: row.createdAt,
      transactionNumber: row.transactionNumber,
      status: row.status,
    }
    const records: Transaction[] = []
    if (row.fromAccountId) records.push({ ...base, accountId: row.fromAccountId, direction: 'out', counterparty: row.toLabel })
    if (row.toAccountId) records.push({ ...base, id: `${row.transactionNumber}-in`, accountId: row.toAccountId, direction: 'in', counterparty: row.fromLabel })
    return records
  })
}

export async function hydrateBankingData() {
  const [accountResponse, kidsResponse, transactionsResponse, notificationsResponse] = await Promise.all([
    fetch('/api/accounts', { cache: 'no-store' }),
    fetch('/api/kids', { cache: 'no-store' }),
    fetch('/api/transactions', { cache: 'no-store' }),
    fetch('/api/notifications', { cache: 'no-store' }),
  ])
  if ([accountResponse, kidsResponse, transactionsResponse, notificationsResponse].some((response) => response.status === 401)) {
    useBankStore.getState().setAuthenticated(false)
    return
  }
  const [account, kids, transactions, notifications] = await Promise.all([
    accountResponse.json() as Promise<{ ok: boolean; account?: Parent }>,
    kidsResponse.json() as Promise<{ ok: boolean; kids?: Kid[]; cards?: BankCard[] }>,
    transactionsResponse.json() as Promise<{ ok: boolean; transactions?: RemoteTransaction[] }>,
    notificationsResponse.json() as Promise<{ ok: boolean; notifications?: AppNotification[] }>,
  ])
  const store = useBankStore.getState()
  if (account.ok && account.account) store.setParent(account.account)
  if (kids.ok) {
    store.replaceKids(kids.kids ?? [])
    store.replaceCards(kids.cards ?? [])
  }
  if (transactions.ok) store.replaceTransactions(toStoreTransactions(transactions.transactions ?? []))
  if (notifications.ok) store.replaceNotifications(notifications.notifications ?? [])
}
