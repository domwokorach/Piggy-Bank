import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface QuickActionProps {
  href: string
  icon: LucideIcon
  label: string
}

export function QuickAction({ href, icon: Icon, label }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-3 py-4 text-center shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </Link>
  )
}
