export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function isValidMobile(value: string): boolean {
  return /^[+\d][\d\s()-]{7,}$/.test(value.trim())
}

export function isStrongPassword(value: string): boolean {
  return value.length >= 8
}

export function isPositiveAmount(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

export function isSixDigitPin(value: string): boolean {
  return /^\d{6}$/.test(value)
}

export interface RegistrationValidationInput {
  firstName: string
  lastName: string
  dob: string
  mobile: string
  email: string
  username: string
  password: string
  confirmPassword: string
}

export function validateRegistration(input: RegistrationValidationInput): string | null {
  if (!input.firstName.trim() || !input.lastName.trim()) return 'Enter your first and last name.'
  if (!input.dob) return 'Enter your date of birth.'
  if (!isValidMobile(input.mobile)) return 'Enter a valid mobile number.'
  if (!isValidEmail(input.email)) return 'Enter a valid email address.'
  if (!input.username.trim()) return 'Choose a username.'
  if (!isStrongPassword(input.password)) return 'Password must be at least 8 characters.'
  if (input.password !== input.confirmPassword) return 'Passwords do not match.'
  return null
}
