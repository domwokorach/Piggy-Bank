import { NextResponse } from 'next/server'
import { readJson, unauthorized } from '@/lib/api'
import { getAuthenticatedUser, hasRequiredAssurance, logAccountEvent } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTransactionNumber } from '@/lib/transaction-number'
import { toPublicTransaction } from '@/lib/transactions'
import { Prisma } from '@/prisma/generated/client'

const MAX_RETRIES = 3

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()
  if (!(await hasRequiredAssurance())) {
    return NextResponse.json({ ok: false, error: 'Complete multi-factor authentication to continue.', code: 'MFA_REQUIRED' }, { status: 403 })
  }
  const body = await readJson(request)
  const direction = body?.direction
  const kidId = typeof body?.kidId === 'string' ? body.kidId : ''
  const amount = Number(body?.amount)
  const reference = typeof body?.reference === 'string' ? body.reference.trim().slice(0, 140) : ''

  if ((direction !== 'parentToKid' && direction !== 'kidToParent') || !kidId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: 'Invalid transfer details.' }, { status: 400 })
  }
  const money = new Prisma.Decimal(amount.toFixed(2))

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const parent = await tx.account.findFirst({
            where: { profileId: auth.user.id, type: 'PARENT', status: 'ACTIVE' },
          })
          const kid = await tx.account.findFirst({
            where: { id: kidId, profileId: auth.user.id, type: 'KID', status: 'ACTIVE' },
          })
          if (!parent || !kid || kid.parentAccountId !== parent.id) throw new Error('ACCOUNT_NOT_FOUND')

          const from = direction === 'parentToKid' ? parent : kid
          const to = direction === 'parentToKid' ? kid : parent
          const debited = await tx.account.updateMany({
            where: { id: from.id, balance: { gte: money }, status: 'ACTIVE' },
            data: { balance: { decrement: money } },
          })
          if (debited.count !== 1) throw new Error('INSUFFICIENT_FUNDS')
          await tx.account.update({ where: { id: to.id }, data: { balance: { increment: money } } })

          const transaction = await tx.transaction.create({
            data: {
              transactionNumber: generateTransactionNumber(),
              profileId: auth.user.id,
              type: direction === 'parentToKid' ? 'PAYMENT' : 'TRANSFER',
              status: 'COMPLETED',
              amount: money,
              fromLabel: from.name,
              toLabel: to.name,
              fromAccountId: from.id,
              toAccountId: to.id,
              reference: reference || 'Family transfer',
              completedAt: new Date(),
            },
          })
          await tx.notification.create({
            data: {
              profileId: auth.user.id,
              type: direction === 'parentToKid' ? 'PAYMENT_RECEIVED' : 'TRANSFER_COMPLETED',
              title: direction === 'parentToKid' ? 'Payment received' : 'Transfer completed',
              message: `${to.name} received £${money.toFixed(2)} from ${from.name}.`,
              actionLabel: 'View transaction',
              actionHref: `/transactions/${transaction.transactionNumber}`,
            },
          })
          return { transaction, parentId: parent.id, kidId: kid.id }
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      )

      await logAccountEvent(auth.user.id, 'transfer_completed', {
        transactionNumber: result.transaction.transactionNumber,
        parentAccountId: result.parentId,
        kidAccountId: result.kidId,
      })
      return NextResponse.json({ ok: true, transaction: toPublicTransaction(result.transaction) })
    } catch (error) {
      if (error instanceof Error && error.message === 'ACCOUNT_NOT_FOUND') {
        return NextResponse.json({ ok: false, error: 'Account not found.' }, { status: 404 })
      }
      if (error instanceof Error && error.message === 'INSUFFICIENT_FUNDS') {
        return NextResponse.json({ ok: false, error: 'This exceeds the available balance.' }, { status: 409 })
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2034' || error.code === 'P2002') && attempt < MAX_RETRIES - 1) {
        continue
      }
      console.error('[transfers] transfer failed', error)
      return NextResponse.json({ ok: false, error: 'Transfer failed. Please try again.' }, { status: 500 })
    }
  }
  return NextResponse.json({ ok: false, error: 'Transfer failed. Please try again.' }, { status: 500 })
}
