export type AccountStatus = 'pending' | 'active' | 'pending_closure' | 'closed'

export interface Parent {
  id: string
  firstName: string
  lastName: string
  dob: string
  mobile: string
  email: string
  username: string
  avatarUrl?: string
  balance: number
  status: AccountStatus
  // Non-sensitive display hints only — the full account number, sort code,
  // card number, expiry, and CVV are never persisted client-side and are
  // fetched on demand once the user steps up (see services/account-security.service.ts).
  accountNumberLast4: string
  cardLast4: string
}

export interface RegistrationDraft {
  firstName: string
  lastName: string
  dob: string
  mobile: string
  email: string
  username: string
  password: string
  avatarUrl?: string
}
