import { NextResponse } from 'next/server'
import { readJson, unauthorized } from '@/lib/api'
import { getAuthenticatedUser, logAccountEvent } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()
  const supabase = await createClient()
  const [{ data: factors, error }, { data: assurance }] = await Promise.all([
    supabase.auth.mfa.listFactors(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ])
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, factors, assurance })
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()
  const body = await readJson(request)
  const friendlyName = typeof body?.friendlyName === 'string' ? body.friendlyName.trim().slice(0, 50) : 'Authenticator app'
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  await logAccountEvent(auth.user.id, 'mfa_enrollment_started', { factorId: data.id })
  return NextResponse.json({ ok: true, factor: data })
}

export async function DELETE(request: Request) {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()
  const body = await readJson(request)
  const factorId = typeof body?.factorId === 'string' ? body.factorId : ''
  if (!factorId) return NextResponse.json({ ok: false, error: 'Factor id is required.' }, { status: 400 })
  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.unenroll({ factorId })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  await logAccountEvent(auth.user.id, 'mfa_factor_removed', { factorId })
  return NextResponse.json({ ok: true })
}
