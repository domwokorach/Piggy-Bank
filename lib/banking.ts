import { randomInt } from 'crypto'
import type { Account, Card, Notification, Profile } from '@/prisma/generated/client'

export function generateAccountNumber() {
  return randomInt(10_000_000, 100_000_000).toString()
}

export function toPublicParent(profile: Profile, account: Account, card?: Card | null) {
  const status =
    profile.status === 'PENDING_CLOSURE'
      ? ('pending_closure' as const)
      : profile.status === 'PENDING'
        ? ('pending' as const)
        : profile.status === 'CLOSED'
          ? ('closed' as const)
          : ('active' as const)
  return {
    id: account.id,
    profileId: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    dob: profile.dob.toISOString().slice(0, 10),
    mobile: profile.mobile,
    email: profile.email,
    username: profile.username,
    avatarUrl: profile.avatarUrl ?? undefined,
    balance: Number(account.balance),
    status,
    accountNumberLast4: account.accountNumber.slice(-4),
    cardLast4: card?.last4 ?? '',
  }
}

export function toPublicKid(account: Account, card?: Card | null) {
  const balance = Number(account.balance)
  return {
    id: account.id,
    parentId: account.parentAccountId!,
    name: account.name,
    avatarUrl: account.avatarUrl ?? undefined,
    color: account.color ?? '#0a2a6b',
    balance,
    savingsTarget: Number(account.savingsTarget ?? 0),
    savingsProgress: balance,
    cardId: card?.id ?? '',
  }
}

export function toPublicCard(card: Card) {
  return {
    id: card.id,
    ownerKidId: card.accountId,
    cardholderName: card.cardholderName,
    last4: card.last4,
    expiry: `${card.expMonth.toString().padStart(2, '0')}/${card.expYear.toString().slice(-2)}`,
    design: 'navy' as const,
    status: card.status.toLowerCase(),
  }
}

export function toPublicNotification(notification: Notification) {
  return {
    id: notification.id,
    type: notification.type.toLowerCase(),
    title: notification.title,
    message: notification.message,
    date: notification.createdAt.toISOString(),
    read: notification.read,
    actionLabel: notification.actionLabel ?? undefined,
    actionHref: notification.actionHref ?? undefined,
    security:
      notification.metadata && typeof notification.metadata === 'object' && !Array.isArray(notification.metadata)
        ? (notification.metadata as Record<string, unknown>).security
        : undefined,
  }
}
