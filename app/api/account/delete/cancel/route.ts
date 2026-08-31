import { NextResponse } from 'next/server'
import { getAuthenticatedUser, logAccountEvent } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const auth = await getAuthenticatedUser()
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Please log in to continue.' }, { status: 401 })
  }

  const { user } = auth

  if (user.status !== 'PENDING_CLOSURE') {
    return NextResponse.json({ ok: false, error: 'No account closure is in progress.' }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.profile.update({
      where: { id: user.id },
      data: {
        status: 'ACTIVE', deletionPinHash: null, deletionPinExpiresAt: null, deletionAttempts: 0,
        deletionPinLastSentAt: null, deletionVerifiedAt: null, closureRequestedAt: null,
      },
    }),
    prisma.account.updateMany({ where: { profileId: user.id, status: 'PENDING_CLOSURE' }, data: { status: 'ACTIVE' } }),
    prisma.notification.create({
      data: { profileId: user.id, type: 'ACCOUNT_CLOSURE_CANCELLED', title: 'Account closure cancelled', message: 'Your account remains active.' },
    }),
  ])

  await logAccountEvent(user.id, 'closure_cancelled')

  return NextResponse.json({ ok: true })
}
