'use client'

import { PiggyBank, Plus } from 'lucide-react'
import Link from 'next/link'
import { KidCard } from '@/components/accounts/KidCard'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { useKids } from '@/hooks/useKids'

export default function KidsAccountsPage() {
  const { kids, cards } = useKids()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kids Accounts"
        subtitle={`${kids.length} linked account${kids.length === 1 ? '' : 's'}`}
        action={
          <Button render={<Link href="/kids/new" />} nativeButton={false} className="h-9 px-4">
            <Plus className="h-4 w-4" />
            Add kid
          </Button>
        }
      />

      {kids.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No kids accounts yet"
          description="Add a kid account to start sending allowances and tracking savings."
          action={
            <Button render={<Link href="/kids/new" />} nativeButton={false} className="mt-2 h-9 px-4">
              Add kid account
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {kids.map((kid) => (
            <KidCard key={kid.id} kid={kid} card={cards.find((c) => c.id === kid.cardId)} />
          ))}
        </div>
      )}
    </div>
  )
}
