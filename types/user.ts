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
