'use client'

import { useState } from 'react'
import { Lock, Snowflake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useKids } from '@/hooks/useKids'
import type { BankCard, CardStatus } from '@/types'

interface FreezeCardControlProps {
  card: BankCard
}

export function FreezeCardControl({ card }: FreezeCardControlProps) {
  const { setCardStatus } = useKids()
  const [pendingStatus, setPendingStatus] = useState<CardStatus | null>(null)

  const confirmChange = async () => {
    if (pendingStatus) {
      await setCardStatus(card.id, pendingStatus)
    }
    setPendingStatus(null)
  }

  const actionLabel = (target: CardStatus) => {
    if (target === 'active') return card.status === 'frozen' ? 'Unfreeze card' : 'Unlock card'
    if (target === 'frozen') return 'Freeze card'
    return 'Lock card'
  }

  return (
    <>
      <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
        {card.status === 'active' ? (
          <>
            <Button variant="outline" className="h-11" onClick={() => setPendingStatus('frozen')}>
              <Snowflake className="h-4 w-4" />
              Freeze
            </Button>
            <Button variant="outline" className="h-11" onClick={() => setPendingStatus('locked')}>
              <Lock className="h-4 w-4" />
              Lock
            </Button>
          </>
        ) : (
          <Button className="col-span-2 h-11" onClick={() => setPendingStatus('active')}>
            {card.status === 'frozen' ? (
              <>
                <Snowflake className="h-4 w-4" />
                Unfreeze card
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Unlock card
              </>
            )}
          </Button>
        )}
      </div>

      <Dialog open={pendingStatus !== null} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingStatus && actionLabel(pendingStatus)}?</DialogTitle>
            <DialogDescription>
              {pendingStatus === 'frozen' && `${card.cardholderName}'s card will be frozen and spending will be disabled.`}
              {pendingStatus === 'locked' && `${card.cardholderName}'s card will be locked immediately.`}
              {pendingStatus === 'active' && `${card.cardholderName}'s card will be reactivated.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingStatus(null)}>
              Cancel
            </Button>
            <Button onClick={confirmChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
