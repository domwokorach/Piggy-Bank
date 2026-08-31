'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useRealtimeBanking } from '@/hooks/useRealtimeBanking'
import { useBankStore } from '@/store/bank-store'
import type { Parent } from '@/types'
import { AppShell } from './AppShell'

export function DashboardShell({ initialParent, children }: { initialParent: Parent; children: ReactNode }) {
  const setParent = useBankStore((state) => state.setParent)
  const setAuthenticated = useBankStore((state) => state.setAuthenticated)
  useEffect(() => {
    setParent(initialParent)
    setAuthenticated(true)
  }, [initialParent, setAuthenticated, setParent])
  useRealtimeBanking(initialParent.profileId ?? initialParent.id)
  return <AppShell>{children}</AppShell>
}
