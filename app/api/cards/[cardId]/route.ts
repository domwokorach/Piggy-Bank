import { NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRequiredAssurance, logAccountEvent } from '@/lib/auth'
import { readJson, unauthorized } from '@/lib/api'
import { toPublicCard } from '@/lib/banking'
import { prisma } from '@/lib/prisma'
import type { CardStatus } from '@/prisma/generated/client'

const statuses: Record<string, CardStatus> = { active: 'ACTIVE', frozen: 'FROZEN', locked: 'LOCKED' }

export async function PATCH(request: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()
  if (!(await hasRequiredAssurance())) {
    return NextResponse.json({ ok: false, error: 'Complete multi-factor authentication to continue.', code: 'MFA_REQUIRED' }, { status: 403 })
  }
  const body = await readJson(request)
  const status = typeof body?.status === 'string' ? statuses[body.status] : undefined
  if (!status) return NextResponse.json({ ok: false, error: 'Invalid card status.' }, { status: 400 })

  const { cardId } = await params
  const card = await prisma.card.findFirst({ where: { id: cardId, account: { profileId: auth.user.id, status: 'ACTIVE' } } })
  if (!card) return NextResponse.json({ ok: false, error: 'Card not found.' }, { status: 404 })

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.card.update({ where: { id: card.id }, data: { status } })
    await tx.notification.create({
      data: {
        profileId: auth.user.id,
        type: status === 'FROZEN' ? 'CARD_FROZEN' : 'CARD_UNLOCKED',
        title: status === 'FROZEN' ? 'Card frozen' : status === 'LOCKED' ? 'Card locked' : 'Card active',
        message: `${card.cardholderName}'s card is now ${status.toLowerCase()}.`,
      },
    })
    return result
  })
  await logAccountEvent(auth.user.id, 'card_status_changed', { cardId, status })
  return NextResponse.json({ ok: true, card: toPublicCard(updated) })
}
