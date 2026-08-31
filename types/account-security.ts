// Fields that must never sit in persisted client state — only ever held
// transiently in memory once the user has stepped up (see
// services/account-security.service.ts).
export interface SensitiveAccountDetails {
  accountNumber: string
  sortCode: string
  cardNumber: string
  cardExpiry: string
  cvv: string
}
