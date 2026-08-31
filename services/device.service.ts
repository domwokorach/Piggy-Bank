import type { ServiceResult } from './types'

export interface RemoteDevice {
  id: string
  label: string
  deviceType: 'MOBILE_PHONE' | 'TABLET' | 'DESKTOP' | 'UNKNOWN'
  os?: string
  browser?: string
  model?: string
  trusted: boolean
  location: string
  lastActiveAt: string
  isCurrent: boolean
}

export async function fetchDevices(): Promise<{ ok: true; devices: RemoteDevice[] } | { ok: false; error: string }> {
  const response = await fetch('/api/devices')
  return response.json()
}

export async function trustDevice(deviceRowId: string): Promise<ServiceResult> {
  const response = await fetch(`/api/devices/${encodeURIComponent(deviceRowId)}/trust`, { method: 'POST' })
  return response.json()
}

export async function removeDevice(deviceRowId: string): Promise<ServiceResult> {
  const response = await fetch(`/api/devices/${encodeURIComponent(deviceRowId)}`, { method: 'DELETE' })
  return response.json()
}

export async function signOutDevice(
  deviceRowId: string,
): Promise<ServiceResult & { signedOutCurrentDevice?: boolean }> {
  const response = await fetch(`/api/devices/${encodeURIComponent(deviceRowId)}/sign-out`, { method: 'POST' })
  return response.json()
}

export async function signOutOtherDevices(): Promise<ServiceResult> {
  const response = await fetch('/api/devices/sign-out-others', { method: 'POST' })
  return response.json()
}
