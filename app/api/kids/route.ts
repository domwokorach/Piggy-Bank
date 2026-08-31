import { randomInt, randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { getAuthenticatedUser, logAccountEvent } from '@/lib/auth'
import { readJson, unauthorized } from '@/lib/api'
import { generateAccountNumber, toPublicCard, toPublicKid } from '@/lib/banking'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()

  const kids = await prisma.account.findMany({
    where: { profileId: auth.user.id, type: 'KID', status: { not: 'CLOSED' } },
    include: { cards: { where: { status: { not: 'CANCELLED' } }, take: 1 } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({
    ok: true,
    kids: kids.map((kid) => toPublicKid(kid, kid.cards[0])),
    cards: kids.flatMap((kid) => kid.cards.map(toPublicCard)),
  })
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()
  const body = await readJson(request)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const savingsTarget = Number(body?.savingsTarget)
  const color = typeof body?.color === 'string' ? body.color : '#0a2a6b'
  if (name.length < 2 || name.length > 80 || !Number.isFinite(savingsTarget) || savingsTarget < 0) {
    return NextResponse.json({ ok: false, error: 'Enter a valid name and savings target.' }, { status: 400 })
  }

  const parent = await prisma.account.findFirst({ where: { profileId: auth.user.id, type: 'PARENT', status: 'ACTIVE' } })
  if (!parent) return NextResponse.json({ ok: false, error: 'Active parent account not found.' }, { status: 409 })

  const kid = await prisma.$transaction(async (tx) => {
    const created = await tx.account.create({
      data: {
        profileId: auth.user.id,
        parentAccountId: parent.id,
        type: 'KID',
        name,
        color,
        accountNumber: generateAccountNumber(),
        sortCode: parent.sortCode,
        savingsTarget,
      },
    })
    const card = await tx.card.create({
      data: {
        accountId: created.id,
        cardholderName: name,
        providerCardId: `pending_${randomUUID()}`,
        last4: randomInt(0, 10_000).toString().padStart(4, '0'),
        brand: 'VISA',
        expMonth: 12,
        expYear: new Date().getFullYear() + 4,
      },
    })
    await tx.notification.create({
      data: { profileId: auth.user.id, type: 'NEW_KID_ACCOUNT', title: 'Kid account created', message: `${name} was added to your family account.` },
    })
    return { ...created, cards: [card] }
  })
  await logAccountEvent(auth.user.id, 'kid_account_created', { accountId: kid.id })
  return NextResponse.json({ ok: true, kid: toPublicKid(kid, kid.cards[0]), card: toPublicCard(kid.cards[0]) }, { status: 201 })
}
