import { createClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS and can perform admin-only auth
// operations (e.g. force-revoking a compromised user's Supabase sessions).
// SUPABASE_SERVICE_ROLE_KEY must never reach the browser; this file is only
// ever imported from server-only code (route handlers, lib/auth.ts).
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
