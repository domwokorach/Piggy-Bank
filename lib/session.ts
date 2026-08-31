import { cookies } from 'next/headers'

const LOGIN_SESSION_COOKIE = 'piggy_login_session'
const COOKIE_DURATION_SECONDS = 60 * 60 * 24 * 30
export const REAUTH_WINDOW_SECONDS = 30 * 60

export interface Session {
  userId: string
  sessionId: string
  issuedAt: number
}

// Supabase Auth owns the actual authentication token; this cookie only
// points at which LoginSession row (device/audit metadata) belongs to this
// browser, so concurrent logins on different devices don't collide. It is
// never used to authenticate a request on its own — getAuthenticatedUser()
// always re-validates the Supabase session first, and cross-checks the
// pointed-at row belongs to that same user.
export async function setLoginSessionCookie(loginSessionId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(LOGIN_SESSION_COOKIE, loginSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_DURATION_SECONDS,
  })
}

export async function clearLoginSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(LOGIN_SESSION_COOKIE)
}

export async function readLoginSessionId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(LOGIN_SESSION_COOKIE)?.value ?? null
}

export function isRecentSession(session: Session): boolean {
  return Date.now() / 1000 - session.issuedAt < REAUTH_WINDOW_SECONDS
}
