import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationPinEmail } from '@/lib/email'
import { generatePin, hashPin, pinExpiryDate } from '@/lib/verification'

export async function POST(request: Request) {
  const { email } = (await request.json()) ?? {}
  const user = await prisma.user.findUnique({ where: { email: (email ?? '').toLowerCase() } })

  if (user && !user.emailVerified) {
    const pin = generatePin()
    const verificationPinHash = await hashPin(pin)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationPinHash,
        verificationPinExpiresAt: pinExpiryDate(),
        verificationAttempts: 0,
      },
    })

    try {
      await sendVerificationPinEmail(user.email, user.firstName, pin)
    } catch (error) {
      console.error('[resend-pin] failed to send verification email', error)
    }
  }

  return NextResponse.json({ ok: true })
}
