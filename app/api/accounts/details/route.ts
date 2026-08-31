import { NextResponse } from 'next/server'
import { unauthorized } from '@/lib/api'
import { getAuthenticatedUser, hasRequiredAssurance } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isRecentSession } from '@/lib/session'

export async function GET() {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()
  if (!isRecentSession(auth.session)) {
    return NextResponse.json({ ok: false, error: 'Log in again to view account details.', code: 'REAUTH_REQUIRED' }, { status: 401 })
  }
  if (!(await hasRequiredAssurance())) {
    return NextResponse.json({ ok: false, error: 'Complete multi-factor authentication to continue.', code: 'MFA_REQUIRED' }, { status: 403 })
  }
  const account = await prisma.account.findFirst({
    where: { profileId: auth.user.id, type: 'PARENT', status: 'ACTIVE' },
    include: { cards: { where: { status: { not: 'CANCELLED' } }, take: 1 } },
  })
  if (!account) return NextResponse.json({ ok: false, error: 'Account not found.' }, { status: 404 })
  const card = account.cards[0]

  await prisma.$transaction([
    prisma.notification.create({
      data: { profileId: auth.user.id, type: 'CARD_DETAILS_VIEWED', title: 'Account details viewed', message: 'Your account details were viewed on a signed-in device.' },
    }),
    prisma.securityEvent.create({ data: { profileId: auth.user.id, type: 'sensitive_details_viewed', sessionId: auth.sessionRow.id } }),
  ])

  return NextResponse.json({
    ok: true,
    details: {
      accountNumber: account.accountNumber,
      sortCode: account.sortCode,
      // Full PAN and CVV live only in the card provider's PCI vault.
      cardNumber: card ? `•••• •••• •••• ${card.last4}` : 'No card issued',
      cardExpiry: card ? `${card.expMonth.toString().padStart(2, '0')}/${card.expYear.toString().slice(-2)}` : '—',
      cvv: 'Not stored',
    },
  })
}
