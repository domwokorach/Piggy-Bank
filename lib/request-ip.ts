export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'unknown'
}

// Shows enough of the address to be recognisable without exposing it in full.
export function maskIp(ip: string): string {
  if (ip === 'unknown') return 'unknown'
  if (ip.includes(':')) {
    const parts = ip.split(':')
    return `${parts.slice(0, 2).join(':')}:••••`
  }
  const parts = ip.split('.')
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.•.•`
  return ip
}
