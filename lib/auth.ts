import { decodeJwt } from 'jose'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { clearLoginSessionCookie, readLoginSessionId, setLoginSessionCookie, type Session } from '@/lib/session'
import type { LoginSession as LoginSessionRow, Prisma, Profile } from '@/prisma/generated/client'

export async function getAuthenticatedUser(): Promise<{
  user: Profile
  session: Session
  sessionRow: LoginSessionRow
} | null> {
  const supabase = await createClient()
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser()
  if (!supabaseUser) return null

  const {
    data: { session: supabaseSession },
  } = await supabase.auth.getSession()
  if (!supabaseSession) return null

  const profile = await prisma.profile.findUnique({ where: { id: supabaseUser.id } })
  if (!profile) return null

  const loginSessionId = await readLoginSessionId()
  if (!loginSessionId) return null

  const sessionRow = await prisma.loginSession.findUnique({ where: { id: loginSessionId } })
  if (!sessionRow || sessionRow.revokedAt || sessionRow.profileId !== profile.id) return null

  const { iat } = decodeJwt(supabaseSession.access_token)
  const session: Session = { userId: profile.id, sessionId: sessionRow.id, issuedAt: iat ?? 0 }

  return { user: profile, session, sessionRow }
}

export async function createLoginSessionForUser(
  profileId: string,
  options: { deviceRowId?: string; ip?: string; userAgent?: string } = {},
): Promise<string> {
  const sessionRow = await prisma.loginSession.create({
    data: { profileId, deviceRowId: options.deviceRowId, ip: options.ip, userAgent: options.userAgent },
  })
  await setLoginSessionCookie(sessionRow.id)
  return sessionRow.id
}

export async function revokeCurrentSession(): Promise<void> {
  const loginSessionId = await readLoginSessionId()
  if (loginSessionId) {
    await prisma.loginSession.updateMany({
      where: { id: loginSessionId },
      data: { revokedAt: new Date(), logoutAt: new Date(), logoutReason: 'user_logout' },
    })
  }
  await clearLoginSessionCookie()

  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function revokeSession(sessionId: string, reason = 'security_revoked'): Promise<void> {
  await prisma.loginSession.updateMany({
    where: { id: sessionId },
    data: { revokedAt: new Date(), logoutAt: new Date(), logoutReason: reason },
  })
}

export async function revokeAllSessionsForUser(profileId: string, exceptSessionId?: string): Promise<void> {
  await prisma.loginSession.updateMany({
    where: { profileId, revokedAt: null, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
    data: { revokedAt: new Date(), logoutAt: new Date(), logoutReason: 'security_revoked' },
  })
}

export async function revokeSessionsForDevice(deviceRowId: string): Promise<void> {
  await prisma.loginSession.updateMany({
    where: { deviceRowId, revokedAt: null },
    data: { revokedAt: new Date(), logoutAt: new Date(), logoutReason: 'device_removed' },
  })
}

export function logAccountEvent(profileId: string, event: string, metadata?: Record<string, unknown>) {
  return prisma.securityEvent.create({
    data: { profileId, type: event, metadata: metadata as Prisma.InputJsonValue },
  })
}

export type ClientAccountStatus = 'pending' | 'active' | 'pending_closure' | 'closed'

export function toClientStatus(profile: Pick<Profile, 'status'>): ClientAccountStatus {
  switch (profile.status) {
    case 'PENDING':
      return 'pending'
    case 'PENDING_CLOSURE':
      return 'pending_closure'
    case 'CLOSED':
      return 'closed'
    default:
      return 'active'
  }
}

export function toPublicProfile(profile: Profile) {
  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    dob: profile.dob.toISOString().slice(0, 10),
    mobile: profile.mobile,
    email: profile.email,
    username: profile.username,
    avatarUrl: profile.avatarUrl ?? undefined,
    status: toClientStatus(profile),
  }
}
