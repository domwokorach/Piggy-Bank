import { NextResponse } from 'next/server'
import { getAuthenticatedUser, logAccountEvent } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendAccountDeletionPinEmail } from '@/lib/email'
import { generatePin, hashPin, pinExpiryDate } from '@/lib/verification'

const RESEND_COOLDOWN_SECONDS = 60

export async function POST() {
  const auth = await getAuthenticatedUser()
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Please log in to continue.' }, { status: 401 })
  }

  const { user } = auth

  if (user.status !== 'PENDING_CLOSURE') {
    return NextResponse.json({ ok: false, error: 'No account closure is in progress.' }, { status: 400 })
  }

  if (user.deletionPinLastSentAt) {
    const secondsSinceLastSend = (Date.now() - user.deletionPinLastSentAt.getTime()) / 1000
    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      return NextResponse.json(
        { ok: false, error: `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSend)}s before requesting another code.` },
        { status: 429 },
      )
    }
  }

  const pin = generatePin()
  const deletionPinHash = await hashPin(pin)

  await prisma.profile.update({
    where: { id: user.id },
    data: {
      deletionPinHash,
      deletionPinExpiresAt: pinExpiryDate(),
      deletionAttempts: 0,
      deletionPinLastSentAt: new Date(),
    },
  })

  await logAccountEvent(user.id, 'closure_pin_resent')

  try {
    await sendAccountDeletionPinEmail(user.email, user.firstName, pin)
  } catch (error) {
    console.error('[account/delete/resend] failed to send deletion PIN email', error)
  }

  return NextResponse.json({ ok: true })
}
