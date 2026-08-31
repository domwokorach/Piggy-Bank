'use client'

import { useCallback } from 'react'
import * as accountDeletionService from '@/services/account-deletion.service'

export function useAccountDeletion() {
  const requestDeletion = useCallback(() => accountDeletionService.requestAccountDeletion(), [])
  const resendPin = useCallback(() => accountDeletionService.resendDeletionPin(), [])
  const verifyPin = useCallback((pin: string) => accountDeletionService.verifyDeletionPin(pin), [])
  const confirmDeletion = useCallback(() => accountDeletionService.confirmAccountDeletion(), [])
  const cancelDeletion = useCallback(() => accountDeletionService.cancelAccountDeletion(), [])

  return { requestDeletion, resendPin, verifyPin, confirmDeletion, cancelDeletion }
}
