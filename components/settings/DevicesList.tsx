'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Laptop, LogOut, ShieldCheck, Smartphone, Tablet, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchDevices,
  removeDevice,
  signOutDevice,
  signOutOtherDevices,
  trustDevice,
  type RemoteDevice,
} from '@/services/device.service'
import { formatDateTime } from '@/lib/utils'

const iconFor = (deviceType: RemoteDevice['deviceType']) => {
  if (deviceType === 'MOBILE_PHONE') return Smartphone
  if (deviceType === 'TABLET') return Tablet
  return Laptop
}

export function DevicesList() {
  const router = useRouter()
  const { logout } = useAuth()

  const [devices, setDevices] = useState<RemoteDevice[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    const result = await fetchDevices()
    if (result.ok) {
      setDevices(result.devices)
    } else {
      setError(result.error)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleTrust = async (deviceRowId: string) => {
    setBusyId(deviceRowId)
    setError(null)
    const result = await trustDevice(deviceRowId)
    if (!result.ok) setError(result.error ?? 'Something went wrong.')
    await load()
    setBusyId(null)
  }

  const handleRemove = async (deviceRowId: string) => {
    setBusyId(deviceRowId)
    setError(null)
    const result = await removeDevice(deviceRowId)
    if (!result.ok) setError(result.error ?? 'Something went wrong.')
    await load()
    setBusyId(null)
  }

  const handleSignOut = async (deviceRowId: string) => {
    setBusyId(deviceRowId)
    setError(null)
    const result = await signOutDevice(deviceRowId)
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong.')
      setBusyId(null)
      return
    }
    if (result.signedOutCurrentDevice) {
      await logout()
      router.push('/login')
      return
    }
    await load()
    setBusyId(null)
  }

  const handleSignOutOthers = async () => {
    setBusyId('others')
    setError(null)
    const result = await signOutOtherDevices()
    if (!result.ok) setError(result.error ?? 'Something went wrong.')
    await load()
    setBusyId(null)
  }

  if (!devices && !error) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
        {devices?.map((device) => {
          const Icon = iconFor(device.deviceType)
          return (
            <div key={device.id} className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{device.label}</p>
                  {device.isCurrent && <Badge variant="outline">This device</Badge>}
                  <Badge variant={device.trusted ? 'secondary' : 'destructive'}>
                    {device.trusted ? 'Trusted' : 'Untrusted'}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {device.os ?? 'Unknown OS'} · {device.browser ?? 'Unknown browser'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {device.location} · Last active {formatDateTime(device.lastActiveAt)}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {!device.trusted && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === device.id}
                      onClick={() => handleTrust(device.id)}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Trust device
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === device.id}
                    onClick={() => handleSignOut(device.id)}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === device.id}
                    onClick={() => handleRemove(device.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Button variant="outline" className="h-11 w-full" onClick={handleSignOutOthers} disabled={busyId === 'others'}>
        Sign out all other devices
      </Button>
    </div>
  )
}
