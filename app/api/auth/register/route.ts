import { randomInt } from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { validateRegistration } from '@/lib/validation'

function generateCustomerNumber(): string {
  return `PB${Date.now().toString(36).toUpperCase()}${randomInt(100, 1000)}`
}

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

  const existingUsername = await prisma.profile.findUnique({ where: { username } })
  if (existingUsername) {
    return NextResponse.json(
      { ok: false, error: 'An account with that email or username already exists.' },
      { status: 409 },
    )
  }

  // Supabase Auth owns credential storage and sends its own verification
  // email with a 6-digit OTP — we no longer hand-roll password hashing or
  // PIN generation for this step.
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email: email.toLowerCase(), password })

  if (error || !data.user) {
    const message = error?.message?.toLowerCase().includes('already registered')
      ? 'An account with that email or username already exists.'
      : (error?.message ?? 'Could not create your account. Please try again.')
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }

  await prisma.profile.create({
    data: {
      id: data.user.id,
      firstName,
      lastName,
      dob: new Date(dob),
      mobile,
      email: email.toLowerCase(),
      username,
      avatarUrl: avatarUrl || null,
      customerNumber: generateCustomerNumber(),
      status: 'PENDING',
    },
  })

  return NextResponse.json({ ok: true })
}
