import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const SESSION_COOKIE = 'piggy_session'
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30
export const REAUTH_WINDOW_SECONDS = 30 * 60

function secretKey() {
  return new TextEncoder().encode(process.env.AUTH_SECRET)
}

export interface Session {
  userId: string
  sessionId: string
  issuedAt: number
}

export async function signSessionToken(userId: string, sessionId: string): Promise<string> {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretKey())
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function readSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secretKey())
    if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string' || typeof payload.iat !== 'number') {
      return null
    }
    return { userId: payload.sub, sessionId: payload.sid, issuedAt: payload.iat }
  } catch {
    return null
  }
}

export function isRecentSession(session: Session): boolean {
  return Date.now() / 1000 - session.issuedAt < REAUTH_WINDOW_SECONDS
}
