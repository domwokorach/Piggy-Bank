import { randomInt } from 'crypto'
import bcrypt from 'bcryptjs'

export const PIN_EXPIRY_MINUTES = 10
export const MAX_VERIFICATION_ATTEMPTS = 5

export function generatePin(): string {
  return randomInt(100000, 1000000).toString()
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10)
}

export async function verifyPinHash(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}

export function pinExpiryDate(): Date {
  return new Date(Date.now() + PIN_EXPIRY_MINUTES * 60 * 1000)
}
