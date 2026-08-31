// Client-side PIN hashing (Web Crypto SHA-256). The raw PIN never touches
// storage — only this digest is persisted, and only it is compared on
// verification. A real backend would additionally salt/peppers this
// server-side; this mock keeps everything local to the device.
export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
