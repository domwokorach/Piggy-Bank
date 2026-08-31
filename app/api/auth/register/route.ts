import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendVerificationPinEmail } from '@/lib/email'
import { generatePin, hashPin, pinExpiryDate } from '@/lib/verification'
import { validateRegistration } from '@/lib/validation'

export async function POST(request: Request) {
  const body = await request.json()
  const { firstName, lastName, dob, mobile, email, username, password, confirmPassword, avatarUrl } = body ?? {}

  const validationError = validateRegistration({
    firstName,
    lastName,
    dob,
    mobile,
    email,
    username,
    password,
    confirmPassword,
  })
  if (validationError) {
    return NextResponse.json({ ok: false, error: validationError }, { status: 400 })
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: email.toLowerCase() }, { username }] },
  })
  if (existing) {
    return NextResponse.json(
      { ok: false, error: 'An account with that email or username already exists.' },
      { status: 409 },
    )
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const pin = generatePin()
  const verificationPinHash = await hashPin(pin)

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      dob: new Date(dob),
      mobile,
      email: email.toLowerCase(),
      username,
      avatarUrl: avatarUrl || null,
      passwordHash,
      verificationPinHash,
      verificationPinExpiresAt: pinExpiryDate(),
      verificationAttempts: 0,
    },
  })

  try {
    await sendVerificationPinEmail(user.email, user.firstName, pin)
  } catch (error) {
    console.error('[register] failed to send verification email', error)
  }

  return NextResponse.json({ ok: true })
}
