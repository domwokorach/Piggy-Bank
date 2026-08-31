import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { unauthorized } from '@/lib/api'
import { toPublicParent } from '@/lib/banking'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()

  const account = await prisma.account.findFirst({
    where: { profileId: auth.user.id, type: 'PARENT', status: { not: 'CLOSED' } },
    include: { cards: { take: 1 } },
  })
  if (!account) {
    return NextResponse.json({ ok: false, error: 'Parent account not found.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, account: toPublicParent(auth.user, account, account.cards[0]) })
}
