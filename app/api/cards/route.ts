import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { unauthorized } from '@/lib/api'
import { toPublicCard } from '@/lib/banking'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()
  const cards = await prisma.card.findMany({
    where: { account: { profileId: auth.user.id }, status: { not: 'CANCELLED' } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ ok: true, cards: cards.map(toPublicCard) })
}
