import { NextResponse } from 'next/server'
import { getAuthenticatedUser, logAccountEvent } from '@/lib/auth'
import { isRecentSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { sendAccountDeletionPinEmail } from '@/lib/email'
import { generatePin, hashPin, pinExpiryDate } from '@/lib/verification'

export async function POST() {
  const auth = await getAuthenticatedUser()
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Please log in to continue.' }, { status: 401 })
  }

  const { user, session } = auth

  if (!isRecentSession(session)) {
    return NextResponse.json(
      { ok: false, error: 'For your security, please log in again before closing your account.', code: 'REAUTH_REQUIRED' },
      { status: 401 },
    )
  }

  if (user.status === 'CLOSED') {
    return NextResponse.json({ ok: false, error: 'This account is already closed.' }, { status: 400 })
  }

  const pin = generatePin()
  const deletionPinHash = await hashPin(pin)

  await prisma.$transaction([
    prisma.profile.update({
      where: { id: user.id },
      data: {
        status: 'PENDING_CLOSURE', deletionPinHash, deletionPinExpiresAt: pinExpiryDate(),
        deletionAttempts: 0, deletionPinLastSentAt: new Date(), deletionVerifiedAt: null, closureRequestedAt: new Date(),
      },
    }),
    prisma.account.updateMany({ where: { profileId: user.id, status: 'ACTIVE' }, data: { status: 'PENDING_CLOSURE' } }),
    prisma.notification.create({
      data: { profileId: user.id, type: 'ACCOUNT_CLOSURE_REQUESTED', title: 'Account closure requested', message: 'Your account closure is awaiting email verification.' },
    }),
  ])

  await logAccountEvent(user.id, 'closure_requested')

  try {
    await sendAccountDeletionPinEmail(user.email, user.firstName, pin)
  } catch (error) {
    console.error('[account/delete/request] failed to send deletion PIN email', error)
  }

  return NextResponse.json({ ok: true })
}
