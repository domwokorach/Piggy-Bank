'use client'

import { useEffect, useState } from 'react'

function getGreetingLabel(date: Date): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export function useGreeting(firstName?: string): string {
  const [label, setLabel] = useState(() => getGreetingLabel(new Date()))

  useEffect(() => {
    const tick = () => setLabel(getGreetingLabel(new Date()))
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  return firstName ? `${label}, ${firstName}` : label
}
