import { useCallback, useState } from 'react'

/**
 * Clock-in / clock-out state. There is no backend yet, so the open session is
 * kept in this browser's localStorage only (survives a reload, nothing more).
 */
const STORAGE_KEY = 'smartime.clockedInAt'

function read(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function write(value: string | null) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable: state still works in memory.
  }
}

export function usePunchState() {
  const [clockedInAt, setClockedInAt] = useState<string | null>(read)

  const toggle = useCallback(() => {
    setClockedInAt((current) => {
      const next = current ? null : new Date().toISOString()
      write(next)
      return next
    })
  }, [])

  return { punched: clockedInAt !== null, clockedInAt, toggle }
}
