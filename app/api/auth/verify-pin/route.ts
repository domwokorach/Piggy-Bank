import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { isSixDigitPin } from '@/lib/validation'

export async function POST(request: Request) {
  const { email, pin } = (await request.json()) ?? {}

  if (!isSixDigitPin(pin ?? '')) {
    return NextResponse.json({ ok: false, error: 'Enter the 6-digit PIN from your email.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({
    email: (email ?? '').toLowerCase(),
    token: pin,
    type: 'signup',
  })

  if (error || !data.user) {
    return NextResponse.json(
      { ok: false, error: 'Incorrect or expired PIN. Please check your email and try again.' },
      { status: 400 },
    )
  }

  await prisma.$transaction([
    prisma.profile.update({ where: { id: data.user.id }, data: { status: 'ACTIVE' } }),
    prisma.account.updateMany({ where: { profileId: data.user.id, type: 'PARENT' }, data: { status: 'ACTIVE' } }),
  ])

  // verifyOtp signs the user in — this endpoint only confirms the email, it
  // shouldn't leave them silently logged in ahead of the actual login step.
  await supabase.auth.signOut()

  return NextResponse.json({ ok: true })
}
