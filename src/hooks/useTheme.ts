import { useCallback, useSyncExternalStore } from 'react'
import { currentTheme, setTheme, subscribeTheme } from '@/lib/theme'

/** Current theme and a toggle. Every mounted toggle stays in sync through the shared store. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, currentTheme)
  const toggle = useCallback(() => setTheme(currentTheme() === 'dark' ? 'light' : 'dark'), [])
  return { theme, toggle }
}
