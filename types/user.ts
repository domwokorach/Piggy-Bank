export type AccountStatus = 'pending' | 'active'

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
