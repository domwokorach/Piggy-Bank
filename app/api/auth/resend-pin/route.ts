import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { email } = (await request.json()) ?? {}

  if (email) {
    const supabase = await createClient()
    // Errors are intentionally swallowed — never reveal whether an account
    // exists via this endpoint's response.
    await supabase.auth.resend({ type: 'signup', email: String(email).toLowerCase() }).catch(() => undefined)
  }

  return NextResponse.json({ ok: true })
}
