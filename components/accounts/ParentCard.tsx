import { ShieldCheck } from 'lucide-react'
import { AvatarCircle } from '@/components/ui/avatar-circle'
import { formatCurrency } from '@/lib/utils'
import type { Parent } from '@/types'

interface ParentCardProps {
  parent: Parent
}

export function ParentCard({ parent }: ParentCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <AvatarCircle name={`${parent.firstName} ${parent.lastName}`} imageUrl={parent.avatarUrl} size="xl" />
      <div className="min-w-0">
        <p className="font-semibold text-foreground">
          {parent.firstName} {parent.lastName}
        </p>
        <p className="text-sm text-muted-foreground">@{parent.username}</p>
        <p className="mt-1 text-sm font-medium text-foreground">{formatCurrency(parent.balance)} available</p>
        {parent.status === 'active' && (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            <ShieldCheck className="h-3 w-3" />
            Verified account
          </span>
        )}
      </div>
    </div>
  )
}
