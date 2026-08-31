import { NextResponse } from 'next/server'
import { getAuthenticatedUser, logAccountEvent } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clearSession } from '@/lib/session'
import { sendAccountClosedEmail } from '@/lib/email'

const VERIFIED_CONFIRM_WINDOW_MS = 10 * 60 * 1000

export async function POST() {
  const auth = await getAuthenticatedUser()
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Please log in to continue.' }, { status: 401 })
  }

  const { user } = auth

  if (user.status !== 'PENDING_CLOSURE') {
    return NextResponse.json({ ok: false, error: 'No account closure is in progress.' }, { status: 400 })
  }

  if (!user.deletionVerifiedAt || Date.now() - user.deletionVerifiedAt.getTime() > VERIFIED_CONFIRM_WINDOW_MS) {
    return NextResponse.json(
      { ok: false, error: 'Please verify your code again before confirming closure.' },
      { status: 400 },
    )
  }

  // NOTE: Kids Accounts, cards, and transfers are not yet backed by Postgres
  // (still mocked client-side) — this closure only affects the parent User
  // record. Freezing linked cards / handling Kids Accounts per policy still
  // needs to be wired up once those move off the mock store.
  await prisma.user.update({
    where: { id: user.id },
    data: {
      status: 'CLOSED',
      closedAt: new Date(),
      sessionVersion: { increment: 1 },
      deletionPinHash: null,
      deletionPinExpiresAt: null,
      deletionAttempts: 0,
      deletionPinLastSentAt: null,
      deletionVerifiedAt: null,
    },
  })

  await logAccountEvent(user.id, 'account_closed')
  await clearSession()

  try {
    await sendAccountClosedEmail(user.email, user.firstName)
  } catch (error) {
    console.error('[account/delete/confirm] failed to send closure confirmation email', error)
  }

  return NextResponse.json({ ok: true })
}
