'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ALL_ACCEPTED_PREFERENCES, ESSENTIAL_ONLY_PREFERENCES } from '@/services/cookie-consent.service'
import { useCookieConsentContext } from '@/components/consent/CookieConsentContext'
import type { OptionalCookieCategory } from '@/types/cookie-consent'

const OPTIONAL_CATEGORIES: {
  key: OptionalCookieCategory
  label: string
  description: string
}[] = [
  {
    key: 'analytics',
    label: 'Analytics Cookies',
    description: 'Help us understand how the app is used so we can improve performance and features.',
  },
  {
    key: 'preferences',
    label: 'Preference Cookies',
    description: 'Remember display and account settings so the app feels the same each time you return.',
  },
  {
    key: 'marketing',
    label: 'Marketing Cookies',
    description: 'Used to tailor offers and messages to your interests across our channels.',
  },
]

export function CookieSettingsModal() {
  const { preferences, isSettingsOpen, closeSettings, savePreferences, acceptAll, rejectOptional } =
    useCookieConsentContext()

  const [draft, setDraft] = useState(preferences)

  useEffect(() => {
    if (isSettingsOpen) {
      setDraft(preferences)
    }
  }, [isSettingsOpen, preferences])

  return (
    <Dialog
      open={isSettingsOpen}
      onOpenChange={(open) => {
        if (!open) closeSettings()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <DialogTitle>Manage cookies</DialogTitle>
          </div>
          <DialogDescription>
            Choose which optional cookies we can use. Essential cookies are always on because the app
            can&apos;t run without them.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col divide-y divide-border">
          <div className="flex items-start justify-between gap-4 py-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="cookie-essential">Essential Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Required for login, security, and core banking features to work.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-0.5">
              <span className="text-xs font-medium text-muted-foreground">Always On</span>
              <Switch id="cookie-essential" checked disabled aria-readonly />
            </div>
          </div>

          {OPTIONAL_CATEGORIES.map((category) => (
            <div key={category.key} className="flex items-start justify-between gap-4 py-3">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor={`cookie-${category.key}`}>{category.label}</Label>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </div>
              <Switch
                id={`cookie-${category.key}`}
                className="mt-0.5 shrink-0"
                checked={draft[category.key]}
                onCheckedChange={(checked) =>
                  setDraft((prev) => ({ ...prev, [category.key]: checked }))
                }
              />
            </div>
          ))}
        </div>

        <Separator />

        <DialogFooter className="sm:grid sm:grid-cols-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDraft(ESSENTIAL_ONLY_PREFERENCES)
              rejectOptional()
            }}
          >
            Reject Optional
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDraft(ALL_ACCEPTED_PREFERENCES)
              acceptAll()
            }}
          >
            Accept All
          </Button>
          <Button onClick={() => savePreferences(draft)}>Save Preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
