import { NextResponse } from 'next/server'
import { getAuthenticatedUser, logAccountEvent, revokeAllSessionsForUser } from '@/lib/auth'

export async function POST() {
  const auth = await getAuthenticatedUser()
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Please log in to continue.' }, { status: 401 })
  }

  await revokeAllSessionsForUser(auth.user.id, auth.session.sessionId)
  await logAccountEvent(auth.user.id, 'sessions_signed_out_others')

  return NextResponse.json({ ok: true })
}
