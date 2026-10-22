/**
 * Light / dark theme. The choice lives on <html data-theme>; tokens.css reacts to it.
 * Until the user picks one with the toggle, the theme follows the OS setting.
 * index.html applies the same logic inline before first paint — keep THEME_KEY in sync.
 */
export type Theme = 'light' | 'dark'

export const THEME_KEY = 'smartime.theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'
const CHANGE_EVENT = 'smartime:themechange'
/** Browser UI color (mobile address bar) per theme: the canvas color. */
const META_COLOR: Record<Theme, string> = { light: '#dfe8f3', dark: '#0e1622' }

function storedChoice(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

const systemTheme = (): Theme => (window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light')

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme])
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

/** The user's explicit choice; it wins over the OS setting from now on. */
export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Not persisted (storage unavailable): still applies for this visit.
  }
  apply(theme)
}

/** Subscribe to theme changes: the toggle, or the OS setting while no choice is stored. */
export function subscribeTheme(onChange: () => void): () => void {
  const mql = window.matchMedia(DARK_QUERY)
  const onSystem = () => {
    if (!storedChoice()) apply(systemTheme())
  }
  mql.addEventListener('change', onSystem)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    mql.removeEventListener('change', onSystem)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}
