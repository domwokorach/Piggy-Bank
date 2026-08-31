'use client'

import { PageHeader } from '@/components/ui/page-header'
import { DeleteAccountFlow } from '@/components/settings/DeleteAccountFlow'

export default function DeleteAccountPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Delete account" subtitle="Security" back />

      <div className="max-w-md rounded-2xl border border-border bg-card p-5 shadow-sm">
        <DeleteAccountFlow />
      </div>
    </div>
  )
}
