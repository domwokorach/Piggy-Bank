const isBrowser = typeof window !== 'undefined'

export function readStorage<T>(key: string): T | null {
  if (!isBrowser) return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable (private browsing, quota exceeded) — fail silently.
  }
}

export function removeStorage(key: string): void {
  if (!isBrowser) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
