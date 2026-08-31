import { NextResponse } from 'next/server'
import { getAuthenticatedUser, logAccountEvent } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSixDigitPin } from '@/lib/validation'
import { MAX_VERIFICATION_ATTEMPTS, verifyPinHash } from '@/lib/verification'

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser()
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Please log in to continue.' }, { status: 401 })
  }

  const { user } = auth
  const { pin } = (await request.json()) ?? {}

  if (user.status !== 'PENDING_CLOSURE') {
    return NextResponse.json({ ok: false, error: 'No account closure is in progress.' }, { status: 400 })
  }

  if (!isSixDigitPin(pin ?? '')) {
    return NextResponse.json({ ok: false, error: 'Enter the 6-digit code from your email.' }, { status: 400 })
  }

  if (!user.deletionPinHash || !user.deletionPinExpiresAt || user.deletionPinExpiresAt < new Date()) {
    return NextResponse.json({ ok: false, error: 'Your code has expired. Request a new one.' }, { status: 410 })
  }

  if (user.deletionAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    return NextResponse.json(
      { ok: false, error: 'Too many incorrect attempts. Request a new code.' },
      { status: 429 },
    )
  }

  const matches = await verifyPinHash(pin, user.deletionPinHash)
  if (!matches) {
    await prisma.user.update({ where: { id: user.id }, data: { deletionAttempts: { increment: 1 } } })
    return NextResponse.json({ ok: false, error: 'Incorrect code. Please check your email and try again.' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      deletionPinHash: null,
      deletionPinExpiresAt: null,
      deletionAttempts: 0,
      deletionVerifiedAt: new Date(),
    },
  })

  await logAccountEvent(user.id, 'closure_pin_verified')

  return NextResponse.json({ ok: true })
}
