import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  seedCards,
  seedKids,
  seedMonthlyActivity,
  seedNotifications,
  seedParent,
  seedTransactions,
} from '@/lib/mock-data'
import type {
  AppNotification,
  BankCard,
  Kid,
  MonthlyActivity,
  Parent,
  RegistrationDraft,
  Transaction,
} from '@/types'

/**
 * This store is the mock "Data/API" layer. It holds raw state and dumb
 * setters only — no validation, no business rules, no derived messaging.
 * Those live in services/. Swap this file for real API/query calls later
 * without touching services, hooks, or components.
 */
interface BankState {
  isAuthenticated: boolean
  rememberMe: boolean

  parent: Parent
  kids: Kid[]
  cards: BankCard[]
  transactions: Transaction[]
  notifications: AppNotification[]
  monthlyActivity: MonthlyActivity[]

  registrationDraft: RegistrationDraft | null

  // Salted hash only — the security PIN itself is never stored or persisted.
  securityPinHash: string | null

  setAuthenticated: (value: boolean, remember?: boolean) => void
  setParent: (patch: Partial<Parent>) => void
  setRegistrationDraft: (draft: RegistrationDraft | null) => void
  setSecurityPinHash: (hash: string | null) => void

  addKidRecord: (kid: Kid) => void
  addCardRecord: (card: BankCard) => void
  updateKid: (kidId: string, patch: Partial<Kid>) => void
  updateCard: (cardId: string, patch: Partial<BankCard>) => void

  addTransactions: (transactions: Transaction[]) => void

  addNotification: (notification: AppNotification) => void
  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void
}

export const useBankStore = create<BankState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      rememberMe: false,

      parent: seedParent,
      kids: seedKids,
      cards: seedCards,
      transactions: seedTransactions,
      notifications: seedNotifications,
      monthlyActivity: seedMonthlyActivity,

      registrationDraft: null,

      securityPinHash: null,

      setAuthenticated: (value, remember) =>
        set((state) => ({ isAuthenticated: value, rememberMe: remember ?? state.rememberMe })),

      setParent: (patch) => set((state) => ({ parent: { ...state.parent, ...patch } })),

      setRegistrationDraft: (draft) => set({ registrationDraft: draft }),

      setSecurityPinHash: (hash) => set({ securityPinHash: hash }),

      addKidRecord: (kid) => set((state) => ({ kids: [...state.kids, kid] })),

      addCardRecord: (card) => set((state) => ({ cards: [...state.cards, card] })),

      updateKid: (kidId, patch) =>
        set((state) => ({
          kids: state.kids.map((k) => (k.id === kidId ? { ...k, ...patch } : k)),
        })),

      updateCard: (cardId, patch) =>
        set((state) => ({
          cards: state.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)),
        })),

      addTransactions: (transactions) =>
        set((state) => ({ transactions: [...transactions, ...state.transactions] })),

      addNotification: (notification) =>
        set((state) => ({ notifications: [notification, ...state.notifications] })),

      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n,
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    {
      name: 'piggy-bank-store',
    },
  ),
)
