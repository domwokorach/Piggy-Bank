'use client'

import { useEffect, useState } from 'react'

/**
 * SSR-safe media query hook. Returns `false` on first render (and during
 * server render) to avoid a hydration mismatch, then syncs to the real
 * value on mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    setMatches(mediaQueryList.matches)

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches)
    mediaQueryList.addEventListener('change', listener)
    return () => mediaQueryList.removeEventListener('change', listener)
  }, [query])

  return matches
}
