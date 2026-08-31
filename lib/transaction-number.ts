import { randomInt } from 'crypto'

// Excludes visually ambiguous characters (0/O, 1/I).
const REFERENCE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const REFERENCE_LENGTH = 6

function datePart(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

function randomReference(): string {
  let result = ''
  for (let i = 0; i < REFERENCE_LENGTH; i++) {
    result += REFERENCE_CHARS[randomInt(0, REFERENCE_CHARS.length)]
  }
  return result
}

export function generateTransactionNumber(date: Date = new Date()): string {
  return `PB-${datePart(date)}-${randomReference()}`
}
