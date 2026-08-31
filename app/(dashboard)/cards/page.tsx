'use client'

import { CreditCard } from 'lucide-react'
import Link from 'next/link'
import { BankCard } from '@/components/banking/BankCard'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { useKids } from '@/hooks/useKids'
import { formatCurrency } from '@/lib/utils'

export default function CardsPage() {
  const { cards, kids } = useKids()

  return (
    <div className="space-y-6">
      <PageHeader title="Cards" subtitle="Manage your kids' bank cards" />

      {cards.length === 0 ? (
        <EmptyState icon={CreditCard} title="No cards yet" description="Add a kid account to issue a card." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const kid = kids.find((k) => k.id === card.ownerKidId)
            return (
              <Link key={card.id} href={`/cards/${card.id}`} className="block space-y-3">
                <BankCard card={card} />
                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="text-sm font-medium text-foreground">{card.cardholderName}</p>
                    {kid && <p className="text-xs text-muted-foreground">{formatCurrency(kid.balance)} available</p>}
                  </div>
                  <Badge variant={card.status === 'active' ? 'secondary' : card.status === 'frozen' ? 'outline' : 'destructive'}>
                    {card.status === 'active' ? 'Active' : card.status === 'frozen' ? 'Frozen' : 'Locked'}
                  </Badge>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
