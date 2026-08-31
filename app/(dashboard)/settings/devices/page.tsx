'use client'

import { PageHeader } from '@/components/ui/page-header'
import { DevicesList } from '@/components/settings/DevicesList'

export default function DevicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Devices" subtitle="Security" back />
      <DevicesList />
    </div>
  )
}
