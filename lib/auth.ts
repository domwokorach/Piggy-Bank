import { prisma } from '@/lib/prisma'
import { readSession, type Session } from '@/lib/session'
import type { Prisma, User } from '@/prisma/generated/client'

export async function getAuthenticatedUser(): Promise<{ user: User; session: Session } | null> {
  const session = await readSession()
  if (!session) return null

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user || user.sessionVersion !== session.sessionVersion) return null

  return { user, session }
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
