import { useEffect, useState } from 'react'

/**
 * Height (px) of the on-screen keyboard covering the bottom of the layout viewport.
 * iOS Safari doesn't shrink the layout viewport when the keyboard opens, so a bottom-anchored
 * sheet would sit behind it; the visual viewport tells us how much is covered.
 */
export function useKeyboardInset(enabled: boolean): number {
  const [inset, setInset] = useState(0)
  useEffect(() => {
    const vv = window.visualViewport
    if (!enabled || !vv) return
    const update = () => setInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)))
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [enabled])
  return enabled ? inset : 0
}
