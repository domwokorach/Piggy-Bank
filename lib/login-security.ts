import { prisma } from '@/lib/prisma'
import { parseDevice, type NativeDeviceInfo } from '@/lib/device'
import type { Device } from '@/prisma/generated/client'

const FAILED_ATTEMPT_WINDOW_MS = 15 * 60 * 1000
const MAX_FAILED_ATTEMPTS = 10
export const NEW_DEVICE_ALERT_THROTTLE_MS = 15 * 60 * 1000

export async function isRateLimited(ip: string): Promise<boolean> {
  if (ip === 'unknown') return false
  const since = new Date(Date.now() - FAILED_ATTEMPT_WINDOW_MS)
  const count = await prisma.loginEvent.count({ where: { ip, status: 'FAILED', createdAt: { gte: since } } })
  return count >= MAX_FAILED_ATTEMPTS
}

export function recordFailedLogin(ip: string, userId: string | null, userAgent: string | null) {
  return prisma.loginEvent.create({
    data: { userId, ip, userAgent, status: 'FAILED' },
  })
}

export interface ResolvedDevice {
  device: Device
  isNewDevice: boolean
}

export async function resolveDevice(
  userId: string,
  deviceCookieId: string,
  userAgent: string | null,
  native?: NativeDeviceInfo,
): Promise<ResolvedDevice> {
  const parsed = parseDevice(userAgent, native)

  const existing = await prisma.device.findUnique({
    where: { userId_deviceId: { userId, deviceId: deviceCookieId } },
  })

  if (existing) {
    // Still surfaced as "new/unrecognised" on every login until trusted.
    return { device: existing, isNewDevice: !existing.trusted }
  }

  const created = await prisma.device.create({
    data: {
      userId,
      deviceId: deviceCookieId,
      label: parsed.label,
      deviceType: parsed.deviceType,
      os: parsed.os,
      browser: parsed.browser,
      model: parsed.model,
    },
  })
  return { device: created, isNewDevice: true }
}

export async function recentlyAlertedForDevice(deviceRowId: string): Promise<boolean> {
  const since = new Date(Date.now() - NEW_DEVICE_ALERT_THROTTLE_MS)
  const count = await prisma.loginEvent.count({
    where: { deviceRowId, isNewDevice: true, createdAt: { gte: since } },
  })
  return count > 0
}
