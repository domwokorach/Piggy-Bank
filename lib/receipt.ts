import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import type { RemoteTransaction } from '@/services/transaction.service'

export function buildReceiptText(transaction: RemoteTransaction): string {
  const lines = [
    'PIGGY BANK — TRANSACTION RECEIPT',
    '',
    `Transaction Number: ${transaction.transactionNumber}`,
    `Date: ${formatDate(transaction.createdAt)}`,
    `Time: ${formatTime(transaction.createdAt)}`,
    `From: ${transaction.fromLabel}`,
    `To: ${transaction.toLabel}`,
    `Amount: ${formatCurrency(transaction.amount)}`,
    `Reference: ${transaction.reference ?? '—'}`,
    `Transaction Type: ${transaction.type}`,
    `Status: ${transaction.status}`,
  ]
  return lines.join('\n')
}

export function downloadReceipt(transaction: RemoteTransaction): void {
  const blob = new Blob([buildReceiptText(transaction)], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${transaction.transactionNumber}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
