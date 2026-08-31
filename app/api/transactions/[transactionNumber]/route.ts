import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toPublicTransaction } from '@/lib/transactions'

export async function GET(_request: Request, { params }: { params: Promise<{ transactionNumber: string }> }) {
  const auth = await getAuthenticatedUser()
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Please log in to continue.' }, { status: 401 })
  }

  const { transactionNumber } = await params
  const transaction = await prisma.transaction.findUnique({ where: { transactionNumber } })

  if (!transaction || transaction.userId !== auth.user.id) {
    return NextResponse.json({ ok: false, error: 'Transaction not found.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, transaction: toPublicTransaction(transaction) })
}
