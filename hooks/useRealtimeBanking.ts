'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { hydrateBankingData } from '@/services/banking.service'

export function useRealtimeBanking(profileId: string) {
  useEffect(() => {
    void hydrateBankingData()
    if (!profileId) return
    const supabase = createClient()
    const refresh = () => void hydrateBankingData()
    const channel = supabase
      .channel(`banking:${profileId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts', filter: `profileId=eq.${profileId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `profileId=eq.${profileId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `profileId=eq.${profileId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, refresh)
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [profileId])
}
