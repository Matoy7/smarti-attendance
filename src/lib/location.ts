import { useSyncExternalStore } from 'react'
import { LOCATION } from './profile'

/**
 * The user's work location. No backend yet: the saved choice lives in this browser's
 * localStorage (like the attendance record); until one is saved the profile default is used.
 */
export type WorkLocation = {
  name: string
  address: string
  /** Provider place id (absent for the built-in default) */
  placeId?: string
}

const KEY = 'smartime.location.v1'
const CHANGE_EVENT = 'smartime:locationchange'
const DEFAULT: WorkLocation = { name: LOCATION.name, address: LOCATION.address }

let cacheRaw: string | null | undefined
let cacheValue: WorkLocation = DEFAULT

function isLocation(v: unknown): v is WorkLocation {
  if (!v || typeof v !== 'object') return false
  const l = v as Record<string, unknown>
  return typeof l.name === 'string' && l.name !== '' && typeof l.address === 'string' && (l.placeId === undefined || typeof l.placeId === 'string')
}

/** Current location; referentially stable while storage is unchanged. */
function snapshot(): WorkLocation {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    // Storage unavailable: default.
  }
  if (raw === cacheRaw) return cacheValue
  cacheRaw = raw
  let parsed: unknown = null
  try {
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    parsed = null
  }
  cacheValue = isLocation(parsed) ? parsed : DEFAULT
  return cacheValue
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange() // other tabs
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

/**
 * Saves the location and reads it back. Resolves only once the write is confirmed;
 * rejects (leaving the previous location in place) otherwise. Async so a server-backed
 * implementation can replace it without touching the UI.
 */
export async function saveLocation(location: WorkLocation): Promise<void> {
  const raw = JSON.stringify({ name: location.name, address: location.address, placeId: location.placeId })
  try {
    localStorage.setItem(KEY, raw)
    if (localStorage.getItem(KEY) !== raw) throw new Error('verify')
  } catch {
    throw new Error('location-save-failed')
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useWorkLocation(): WorkLocation {
  return useSyncExternalStore(subscribe, snapshot)
}

/** The mobile layout shows addresses without the trailing country. */
export function withoutCountry(address: string): string {
  return address.replace(/,\s*(ישראל|Israel)\s*$/u, '')
}
