import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createTransactionRecord, parseClientStatus, parseClientType, toPublicTransaction } from '@/lib/transactions'
import { sendTransactionReceiptEmail } from '@/lib/email'
import { isPositiveAmount } from '@/lib/validation'

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser()
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Please log in to continue.' }, { status: 401 })
  }

  const body = (await request.json()) ?? {}
  const type = parseClientType(body.type)
  const status = body.status === undefined ? undefined : parseClientStatus(body.status)
  const amount = Number(body.amount)

  if (!type) {
    return NextResponse.json({ ok: false, error: 'Invalid transaction type.' }, { status: 400 })
  }
  if (body.status !== undefined && !status) {
    return NextResponse.json({ ok: false, error: 'Invalid transaction status.' }, { status: 400 })
  }
  if (!isPositiveAmount(amount)) {
    return NextResponse.json({ ok: false, error: 'Enter an amount greater than £0.' }, { status: 400 })
  }
  if (!body.fromLabel || !body.toLabel) {
    return NextResponse.json({ ok: false, error: 'Missing from/to account labels.' }, { status: 400 })
  }

  const transaction = await createTransactionRecord({
    userId: auth.user.id,
    type,
    status: status ?? undefined,
    amount,
    fromLabel: String(body.fromLabel),
    toLabel: String(body.toLabel),
    fromAccountId: body.fromAccountId ? String(body.fromAccountId) : undefined,
    toAccountId: body.toAccountId ? String(body.toAccountId) : undefined,
    reference: body.reference ? String(body.reference) : undefined,
    category: body.category ? String(body.category) : undefined,
  })

  const publicTransaction = toPublicTransaction(transaction)

  try {
    await sendTransactionReceiptEmail(auth.user.email, auth.user.firstName, publicTransaction)
  } catch (error) {
    console.error('[transactions] failed to send receipt email', error)
  }

  return NextResponse.json({ ok: true, transaction: publicTransaction })
}
