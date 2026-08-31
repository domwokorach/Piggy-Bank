'use client'

import { useCallback } from 'react'
import { useBankStore } from '@/store/bank-store'
import { hashPin } from '@/lib/security-pin'

export function useSecurityPin() {
  const securityPinHash = useBankStore((s) => s.securityPinHash)
  const setSecurityPinHash = useBankStore((s) => s.setSecurityPinHash)

  const hasPin = securityPinHash !== null

  const createPin = useCallback(
    async (pin: string) => {
      setSecurityPinHash(await hashPin(pin))
    },
    [setSecurityPinHash],
  )

  const verifyPin = useCallback(
    async (pin: string) => {
      if (!securityPinHash) return false
      return (await hashPin(pin)) === securityPinHash
    },
    [securityPinHash],
  )

  return { hasPin, createPin, verifyPin }
}
