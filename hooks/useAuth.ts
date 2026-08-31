'use client'

import { useCallback } from 'react'
import * as authService from '@/services/auth.service'
import { useBankStore } from '@/store/bank-store'
import type { RegistrationDraft } from '@/types'

export function useAuth() {
  const isAuthenticated = useBankStore((s) => s.isAuthenticated)
  const parent = useBankStore((s) => s.parent)
  const pendingPin = useBankStore((s) => s.pendingPin)
  const registrationDraft = useBankStore((s) => s.registrationDraft)

  const login = useCallback(
    (identifier: string, password: string, remember: boolean) => authService.login(identifier, password, remember),
    [],
  )

  const register = useCallback(
    (draft: RegistrationDraft, confirmPassword: string) => authService.registerParent(draft, confirmPassword),
    [],
  )

  const resendPin = useCallback(() => authService.resendPin(), [])

  const verifyPin = useCallback((pin: string) => authService.verifyPin(pin), [])

  const logout = useCallback(() => authService.logout(), [])

  return {
    isAuthenticated,
    parent,
    pendingPin,
    registrationDraft,
    login,
    register,
    resendPin,
    verifyPin,
    logout,
  }
}
