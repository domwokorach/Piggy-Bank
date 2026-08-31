import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toPublicTransaction } from '@/lib/transactions'

export async function GET() {
  const auth = await getAuthenticatedUser()
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Please log in to continue.' }, { status: 401 })
  }
  const transactions = await prisma.transaction.findMany({
    where: { profileId: auth.user.id },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json({ ok: true, transactions: transactions.map(toPublicTransaction) })
}
