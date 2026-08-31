import { randomUUID } from 'crypto'
import { cookies } from 'next/headers'

const DEVICE_COOKIE = 'piggy_device'
const DEVICE_COOKIE_DURATION_SECONDS = 60 * 60 * 24 * 730 // ~2 years

/**
 * A long-lived, opaque identifier for this browser — the actual "secure
 * device identifier" new-device detection keys off, independent of the
 * User-Agent string (which only describes browser/OS, not the physical
 * device across sessions).
 */
export async function getOrCreateDeviceCookie(): Promise<string> {
  const cookieStore = await cookies()
  const existing = cookieStore.get(DEVICE_COOKIE)?.value
  if (existing) return existing

  const id = randomUUID()
  cookieStore.set(DEVICE_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DEVICE_COOKIE_DURATION_SECONDS,
  })
  return id
}
