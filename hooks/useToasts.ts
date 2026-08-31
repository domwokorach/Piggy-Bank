'use client'

import { useCallback } from 'react'
import { useToastStore } from '@/store/toast-store'
import { autoDismissToast, dismissToast } from '@/services/notification.service'

export function useToasts() {
  const visible = useToastStore((s) => s.visible)
  const dismiss = useCallback((id: string) => dismissToast(id), [])
  const autoDismiss = useCallback((id: string) => autoDismissToast(id), [])

  return { visible, dismiss, autoDismiss }
}
