import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isSixDigitPin } from '@/lib/validation'
import { MAX_VERIFICATION_ATTEMPTS, verifyPinHash } from '@/lib/verification'

export async function POST(request: Request) {
  const { email, pin } = (await request.json()) ?? {}

  if (!isSixDigitPin(pin ?? '')) {
    return NextResponse.json({ ok: false, error: 'Enter the 6-digit PIN from your email.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: (email ?? '').toLowerCase() } })
  if (!user) {
    return NextResponse.json({ ok: false, error: 'We could not find that account.' }, { status: 404 })
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: true })
  }

  if (!user.verificationPinHash || !user.verificationPinExpiresAt || user.verificationPinExpiresAt < new Date()) {
    return NextResponse.json(
      { ok: false, error: 'Your PIN has expired. Request a new one.' },
      { status: 410 },
    )
  }

  if (user.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    return NextResponse.json(
      { ok: false, error: 'Too many incorrect attempts. Request a new PIN.' },
      { status: 429 },
    )
  }

  const matches = await verifyPinHash(pin, user.verificationPinHash)
  if (!matches) {
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationAttempts: { increment: 1 } },
    })
    return NextResponse.json({ ok: false, error: 'Incorrect PIN. Please check your email and try again.' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationPinHash: null,
      verificationPinExpiresAt: null,
      verificationAttempts: 0,
    },
  })

  return NextResponse.json({ ok: true })
}
