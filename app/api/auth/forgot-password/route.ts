import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { email } = (await request.json()) ?? {}
  const normalizedEmail = (email ?? '').toLowerCase()
  const profile = await prisma.profile.findUnique({ where: { email: normalizedEmail } })

  // Always respond ok — never reveal whether an account exists.
  if (!profile || profile.status === 'CLOSED') {
    return NextResponse.json({ ok: true })
  }

  const supabase = await createClient()
  // Sends Supabase's own 6-digit recovery OTP email — resend cooldowns are
  // enforced by the Supabase project itself, no bespoke throttle needed here.
  await supabase.auth.resetPasswordForEmail(normalizedEmail).catch(() => undefined)

  return NextResponse.json({ ok: true })
}
