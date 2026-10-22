import { useSyncExternalStore } from 'react'
import type { NavId } from './navigation'
import { NAV_SECTIONS } from './navigation'
import { hasPermission } from './permissions'
import { USER } from './profile'

/**
 * Hash routing (#/attendance, #/team-reports). GitHub Pages serves one document, and the build
 * uses a relative base, so the path never changes — only the hash does.
 */

/** Destinations that have a screen. Other nav items stay inert until their screen exists. */
const SCREENS = new Set<NavId>(['attendance', 'team-reports'])
const HOME: NavId = 'attendance'

/** Whether `id` has a screen the current user may open (respects the section's permission). */
export function isRoutable(id: NavId, user = USER): boolean {
  if (!SCREENS.has(id)) return false
  const section = NAV_SECTIONS.find((s) => s.items.some((item) => item.id === id))
  return !section?.permission || hasPermission(user, section.permission)
}

function parse(hash: string): NavId {
  const id = hash.replace(/^#\/?/, '').split(/[/?]/)[0] as NavId
  return isRoutable(id) ? id : HOME
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useRoute(): NavId {
  return useSyncExternalStore(subscribe, () => parse(window.location.hash))
}

/** Go to a screen; ignores destinations without one. */
export function navigate(id: NavId) {
  if (!isRoutable(id)) return
  const hash = `#/${id}`
  if (window.location.hash !== hash) window.location.hash = hash
}
