import { prisma } from '@/lib/prisma'
import { clearSessionCookie, readSession, setSessionCookie, signSessionToken, type Session } from '@/lib/session'
import type { Prisma, Session as SessionRow, User } from '@/prisma/generated/client'

export async function getAuthenticatedUser(): Promise<{ user: User; session: Session; sessionRow: SessionRow } | null> {
  const session = await readSession()
  if (!session) return null

  const sessionRow = await prisma.session.findUnique({ where: { id: session.sessionId } })
  if (!sessionRow || sessionRow.revokedAt || sessionRow.userId !== session.userId) return null

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return null

  return { user, session, sessionRow }
}

export async function createSessionForUser(
  userId: string,
  options: { deviceRowId?: string; ip?: string; userAgent?: string } = {},
): Promise<string> {
  const sessionRow = await prisma.session.create({
    data: { userId, deviceRowId: options.deviceRowId, ip: options.ip, userAgent: options.userAgent },
  })
  const token = await signSessionToken(userId, sessionRow.id)
  await setSessionCookie(token)
  return sessionRow.id
}

export async function revokeCurrentSession(): Promise<void> {
  const session = await readSession()
  if (session) {
    await prisma.session.updateMany({ where: { id: session.sessionId }, data: { revokedAt: new Date() } })
  }
  await clearSessionCookie()
}

export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.session.updateMany({ where: { id: sessionId }, data: { revokedAt: new Date() } })
}

export async function revokeAllSessionsForUser(userId: string, exceptSessionId?: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
    data: { revokedAt: new Date() },
  })
}

export async function revokeSessionsForDevice(deviceRowId: string): Promise<void> {
  await prisma.session.updateMany({ where: { deviceRowId, revokedAt: null }, data: { revokedAt: new Date() } })
}

export function logAccountEvent(userId: string, event: string, metadata?: Record<string, unknown>) {
  return prisma.accountAuditLog.create({
    data: { userId, event, metadata: metadata as Prisma.InputJsonValue },
  })
}

export type ClientAccountStatus = 'pending' | 'active' | 'pending_closure' | 'closed'

export function toClientStatus(user: Pick<User, 'emailVerified' | 'status'>): ClientAccountStatus {
  if (!user.emailVerified) return 'pending'
  switch (user.status) {
    case 'PENDING_CLOSURE':
      return 'pending_closure'
    case 'CLOSED':
      return 'closed'
    default:
      return 'active'
  }
}

export function toPublicProfile(user: User) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    dob: user.dob.toISOString().slice(0, 10),
    mobile: user.mobile,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl ?? undefined,
    status: toClientStatus(user),
  }
}
