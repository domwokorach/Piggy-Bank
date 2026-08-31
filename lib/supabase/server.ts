import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Request-scoped Supabase client for use inside route handlers. Reads the
// caller's session from cookies; writes are best-effort (a Server Component
// can't set cookies at all — middleware.ts is what actually refreshes the
// session cookie on every request).
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component render — safe to ignore.
        }
      },
    },
  })
}
