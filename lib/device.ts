import { UAParser as UAParserLib } from 'ua-parser-js'
import type { DeviceType } from '@/prisma/generated/client'

// ua-parser-js's `export =` typings don't merge cleanly with esModuleInterop
// default imports; it's callable at runtime (`UAParser(ua)` returns the
// result directly), so cast to the shape we actually use.
interface UAParserResult {
  browser: { name?: string }
  os: { name?: string }
  device: { type?: string; vendor?: string; model?: string }
}
const UAParser = UAParserLib as unknown as (ua: string) => UAParserResult

export interface ParsedDevice {
  deviceType: DeviceType
  os?: string
  browser?: string
  model?: string
  label: string
}

// Native device info passed up from a Capacitor app (see lib/native-device.ts
// on the client). Preferred over UA parsing when present, since Capacitor
// reports real hardware info the WebView's UA string can't.
export interface NativeDeviceInfo {
  platform?: 'ios' | 'android' | 'web'
  model?: string
  manufacturer?: string
  osVersion?: string
}

function toDeviceType(uaType: string | undefined, platform?: string): DeviceType {
  if (uaType === 'mobile' || platform === 'ios' || platform === 'android') return 'MOBILE_PHONE'
  if (uaType === 'tablet') return 'TABLET'
  if (uaType === undefined && platform === 'web') return 'DESKTOP'
  if (uaType === undefined) return 'DESKTOP'
  return 'UNKNOWN'
}

export function parseDevice(userAgent: string | null, native?: NativeDeviceInfo): ParsedDevice {
  const result = UAParser(userAgent ?? '')

  const browser = result.browser.name
  const os = native?.osVersion
    ? `${native.platform === 'ios' ? 'iOS' : native.platform === 'android' ? 'Android' : result.os.name} ${native.osVersion}`
    : result.os.name

  // Only ever surface a model when it's reliably known — never invent one.
  // iOS Safari never reveals the exact hardware model in its UA string.
  const model = native?.model || result.device.model || undefined

  const deviceType = toDeviceType(result.device.type, native?.platform)

  const labelParts = [model || result.device.vendor || (deviceType === 'DESKTOP' ? os : undefined), browser].filter(
    Boolean,
  )
  const label = labelParts.length > 0 ? labelParts.join(' · ') : 'Unknown device'

  return { deviceType, os: os ?? undefined, browser: browser ?? undefined, model, label }
}
