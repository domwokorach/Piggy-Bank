import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revokeAllSessionsForUser, logAccountEvent } from '@/lib/auth'
import { isSixDigitPin, isStrongPassword } from '@/lib/validation'

export async function POST(request: Request) {
  const { email, pin, newPassword } = (await request.json()) ?? {}
  const normalizedEmail = (email ?? '').toLowerCase()
  const profile = await prisma.profile.findUnique({ where: { email: normalizedEmail } })

  if (!profile) {
    return NextResponse.json({ ok: false, error: 'Invalid or expired code.' }, { status: 400 })
  }

  if (!isSixDigitPin(pin ?? '')) {
    return NextResponse.json({ ok: false, error: 'Enter the 6-digit code from your email.' }, { status: 400 })
  }

  if (!isStrongPassword(newPassword ?? '')) {
    return NextResponse.json({ ok: false, error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const supabase = await createClient()

  // Supabase's recovery OTP both verifies the code and establishes a
  // short-lived session, which updateUser() then uses to set the new
  // password — replacing our old hand-rolled resetPinHash comparison.
  const { data, error } = await supabase.auth.verifyOtp({ email: normalizedEmail, token: pin, type: 'recovery' })
  if (error || !data.user) {
    return NextResponse.json({ ok: false, error: 'Incorrect or expired code. Please check your email and try again.' }, { status: 400 })
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) {
    return NextResponse.json({ ok: false, error: 'Could not reset your password. Please try again.' }, { status: 400 })
  }

  await prisma.profile.update({ where: { id: profile.id }, data: { mustResetPassword: false } })
  await revokeAllSessionsForUser(profile.id)
  await logAccountEvent(profile.id, 'password_reset_completed')

  // The recovery verification leaves an active Supabase session — this
  // endpoint only resets the password, the user still logs in separately.
  await supabase.auth.signOut()

  return NextResponse.json({ ok: true })
}
