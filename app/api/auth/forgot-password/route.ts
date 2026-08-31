import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetPinEmail } from '@/lib/email'
import { generatePin, hashPin, pinExpiryDate } from '@/lib/verification'

const RESEND_COOLDOWN_SECONDS = 60

export async function POST(request: Request) {
  const { email } = (await request.json()) ?? {}
  const user = await prisma.user.findUnique({ where: { email: (email ?? '').toLowerCase() } })

  // Always respond ok — never reveal whether an account exists.
  if (!user || user.status === 'CLOSED') {
    return NextResponse.json({ ok: true })
  }

  if (user.resetPinLastSentAt) {
    const secondsSinceLastSend = (Date.now() - user.resetPinLastSentAt.getTime()) / 1000
    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      return NextResponse.json({ ok: true })
    }
  }

  const pin = generatePin()
  const resetPinHash = await hashPin(pin)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPinHash,
      resetPinExpiresAt: pinExpiryDate(),
      resetAttempts: 0,
      resetPinLastSentAt: new Date(),
    },
  })

  try {
    await sendPasswordResetPinEmail(user.email, user.firstName, pin)
  } catch (error) {
    console.error('[forgot-password] failed to send reset PIN email', error)
  }

  return NextResponse.json({ ok: true })
}
