import { Capacitor } from '@capacitor/core'

export interface NativeDevicePayload {
  platform: 'ios' | 'android' | 'web'
  model?: string
  manufacturer?: string
  osVersion?: string
}

/**
 * Collects real hardware info from @capacitor/device when running inside the
 * native Capacitor shell. Returns null on the web, where there's nothing
 * more reliable to report than the User-Agent string the server already
 * parses.
 */
export async function getNativeDeviceInfo(): Promise<NativeDevicePayload | null> {
  if (!Capacitor.isNativePlatform()) return null

  try {
    const { Device } = await import('@capacitor/device')
    const info = await Device.getInfo()
    return {
      platform: info.platform === 'ios' || info.platform === 'android' ? info.platform : 'web',
      model: info.model,
      manufacturer: info.manufacturer,
      osVersion: info.osVersion,
    }
  } catch {
    return null
  }
}
