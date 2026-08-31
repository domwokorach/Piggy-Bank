import { NextResponse } from 'next/server'
import { readJson, unauthorized } from '@/lib/api'
import { getAuthenticatedUser, logAccountEvent } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()
  const body = await readJson(request)
  const factorId = typeof body?.factorId === 'string' ? body.factorId : ''
  const code = typeof body?.code === 'string' ? body.code.trim() : ''
  if (!factorId || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid six-digit MFA code.' }, { status: 400 })
  }
  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
  if (error) return NextResponse.json({ ok: false, error: 'Invalid or expired MFA code.' }, { status: 400 })
  await logAccountEvent(auth.user.id, 'mfa_verified', { factorId })
  return NextResponse.json({ ok: true })
}
