'use client'

import { type FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AvatarCircle } from '@/components/ui/avatar-circle'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useKids } from '@/hooks/useKids'
import { cn } from '@/lib/utils'

const colors = ['#0a2a6b', '#2f6fed', '#0f7a56', '#b26a00', '#7a3ba0', '#0e8f9e']

export default function AddKidPage() {
  const router = useRouter()
  const { addKid } = useKids()

  const [name, setName] = useState('')
  const [savingsTarget, setSavingsTarget] = useState('50')
  const [color, setColor] = useState(colors[0])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    addKid(name.trim(), Number(savingsTarget) || 0, color)
    router.push('/kids')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Add kid account" subtitle="Link a new account for your child" back />

      <form onSubmit={handleSubmit} className="max-w-md space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <AvatarCircle name={name || 'New kid'} color={color} size="xl" />
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-card transition-transform',
                  color === c ? 'ring-foreground scale-110' : 'ring-transparent',
                )}
                style={{ backgroundColor: c }}
                aria-label={`Choose color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kidName">Child&apos;s name</Label>
          <Input id="kidName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Freya Bennett" className="h-11" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="savingsTarget">Savings target</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">£</span>
            <Input
              id="savingsTarget"
              type="number"
              min={0}
              step={1}
              value={savingsTarget}
              onChange={(e) => setSavingsTarget(e.target.value)}
              className="h-11 pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground">Your child will see progress toward this goal.</p>
        </div>

        <Button type="submit" className="h-11 w-full text-base">
          Create kid account
        </Button>
      </form>
    </div>
  )
}
