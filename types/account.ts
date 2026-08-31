export type AccountType = 'parent' | 'kid'

export interface AccountRef {
  id: string
  type: AccountType
  name: string
  balance: number
}
