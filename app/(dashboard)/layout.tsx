import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/navigation/DashboardShell'
import { getAuthenticatedUser } from '@/lib/auth'
import { toPublicParent } from '@/lib/banking'
import { prisma } from '@/lib/prisma'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthenticatedUser()
  if (!auth) redirect('/login')
  const account = await prisma.account.findFirst({
    where: { profileId: auth.user.id, type: 'PARENT', status: { not: 'CLOSED' } },
    include: { cards: { take: 1 } },
  })
  if (!account) redirect('/login')
  return <DashboardShell initialParent={toPublicParent(auth.user, account, account.cards[0])}>{children}</DashboardShell>
}
