import { NextResponse } from 'next/server'
import { getAuthenticatedUser, logAccountEvent, revokeAllSessionsForUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clearLoginSessionCookie } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
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

  await prisma.$transaction([
    prisma.profile.update({
      where: { id: user.id },
      data: {
        status: 'CLOSED', closedAt: new Date(), deletionPinHash: null, deletionPinExpiresAt: null,
        deletionAttempts: 0, deletionPinLastSentAt: null, deletionVerifiedAt: null,
      },
    }),
    prisma.account.updateMany({ where: { profileId: user.id }, data: { status: 'CLOSED' } }),
    prisma.card.updateMany({ where: { account: { profileId: user.id } }, data: { status: 'CANCELLED' } }),
    prisma.notification.create({
      data: { profileId: user.id, type: 'ACCOUNT_CLOSED', title: 'Account closed', message: 'Your Piggy Bank account has been closed.' },
    }),
  ])

  await revokeAllSessionsForUser(user.id)
  await logAccountEvent(user.id, 'account_closed')
  await clearLoginSessionCookie()
  const supabase = await createClient()
  await supabase.auth.signOut()

  try {
    await sendAccountClosedEmail(user.email, user.firstName)
  } catch (error) {
    console.error('[account/delete/confirm] failed to send closure confirmation email', error)
  }

  return NextResponse.json({ ok: true })
}
