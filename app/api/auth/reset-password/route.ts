import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { revokeAllSessionsForUser, logAccountEvent } from '@/lib/auth'
import { isSixDigitPin, isStrongPassword } from '@/lib/validation'
import { MAX_VERIFICATION_ATTEMPTS, verifyPinHash } from '@/lib/verification'

export async function POST(request: Request) {
  const { email, pin, newPassword } = (await request.json()) ?? {}
  const user = await prisma.user.findUnique({ where: { email: (email ?? '').toLowerCase() } })

  if (!user) {
    return NextResponse.json({ ok: false, error: 'Invalid or expired code.' }, { status: 400 })
  }

  if (!isSixDigitPin(pin ?? '')) {
    return NextResponse.json({ ok: false, error: 'Enter the 6-digit code from your email.' }, { status: 400 })
  }

  if (!isStrongPassword(newPassword ?? '')) {
    return NextResponse.json({ ok: false, error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  if (!user.resetPinHash || !user.resetPinExpiresAt || user.resetPinExpiresAt < new Date()) {
    return NextResponse.json({ ok: false, error: 'Your code has expired. Request a new one.' }, { status: 410 })
  }

  if (user.resetAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    return NextResponse.json({ ok: false, error: 'Too many incorrect attempts. Request a new code.' }, { status: 429 })
  }

  const matches = await verifyPinHash(pin, user.resetPinHash)
  if (!matches) {
    await prisma.user.update({ where: { id: user.id }, data: { resetAttempts: { increment: 1 } } })
    return NextResponse.json({ ok: false, error: 'Incorrect code. Please check your email and try again.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      mustResetPassword: false,
      resetPinHash: null,
      resetPinExpiresAt: null,
      resetAttempts: 0,
      resetPinLastSentAt: null,
    },
  })

  await revokeAllSessionsForUser(user.id)
  await logAccountEvent(user.id, 'password_reset_completed')

  return NextResponse.json({ ok: true })
}
