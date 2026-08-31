export interface ApproximateLocation {
  city?: string
  country?: string
}

const PRIVATE_IP_PATTERNS = [/^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./, /^::1$/, /^fc/, /^fe80/]

function isPrivateOrUnknownIp(ip: string): boolean {
  if (!ip || ip === 'unknown') return true
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip))
}

/**
 * Best-effort, approximate city/country lookup from an IP address. This is
 * never GPS-exact — IP geolocation only narrows down to a rough city/region.
 * Never throws; returns {} on any failure, timeout, or private/local IP.
 */
export async function getApproximateLocation(ip: string): Promise<ApproximateLocation> {
  if (isPrivateOrUnknownIp(ip)) return {}

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'piggy-bank-app' },
    })
    clearTimeout(timeout)
    if (!response.ok) return {}

    const data = await response.json()
    if (data.error) return {}

    return {
      city: typeof data.city === 'string' ? data.city : undefined,
      country: typeof data.country_name === 'string' ? data.country_name : undefined,
    }
  } catch {
    return {}
  }
}
