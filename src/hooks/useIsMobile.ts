import { useSyncExternalStore } from 'react'

/** Viewports at or below this width get the mobile layout (from the mobile Figma export). */
export const MOBILE_QUERY = '(max-width: 760px)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(MOBILE_QUERY).matches)
}
