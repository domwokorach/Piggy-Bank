'use client'

import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/navigation/AppShell'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    redirect('/login')
  }

  return <AppShell>{children}</AppShell>
}
