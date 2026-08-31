'use client'

import { useState } from 'react'
import { Bell, ChevronRight, Laptop, LogOut, Mail, Phone, PiggyBank, ShieldAlert, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ParentCard } from '@/components/accounts/ParentCard'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/useAuth'
import { useKids } from '@/hooks/useKids'

export default function SettingsPage() {
  const router = useRouter()
  const { parent, logout } = useAuth()
  const { kids } = useKids()

  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(true)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <ParentCard parent={parent} />

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <h2 className="px-5 pt-4 text-sm font-semibold text-foreground">Account details</h2>
        <div className="divide-y divide-border">
          <InfoRow icon={User} label="Full name" value={`${parent.firstName} ${parent.lastName}`} />
          <InfoRow icon={Mail} label="Email" value={parent.email} />
          <InfoRow icon={Phone} label="Mobile" value={parent.mobile} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <h2 className="px-5 pt-4 text-sm font-semibold text-foreground">Family</h2>
        <Link href="/kids" className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <PiggyBank className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Kids accounts</p>
            <p className="text-xs text-muted-foreground">{kids.length} linked accounts</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
        <div className="mt-3 space-y-3">
          <label className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Push notifications
            </span>
            <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
          </label>
          <label className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email notifications
            </span>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <h2 className="px-5 pt-4 text-sm font-semibold text-foreground">Security</h2>
        <div className="divide-y divide-border">
          <Link href="/settings/devices" className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Laptop className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Devices</p>
              <p className="text-xs text-muted-foreground">Manage devices signed in to your account</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            href="/settings/delete-account"
            className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Delete account</p>
              <p className="text-xs text-muted-foreground">Permanently close your Piggy Bank account</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </section>

      <Button variant="destructive" className="h-11 w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
