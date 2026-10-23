import type { NavBadge as Badge } from '@/lib/notifications'

/**
 * Notification circle on a navigation item (secondary/orange color, no number).
 * Screen readers get the full sentence ("9 בקשות ממתינות לאישור") as part of the item's name.
 */
export function NavBadge({ badge, className = '', part = 'both' }: { badge?: Badge; className?: string; part?: 'both' | 'dot' | 'text' }) {
  if (!badge) return null
  return (
    <>
      {part !== 'text' && <span className={`nav-badge ${className}`.trim()} aria-hidden="true" />}
      {part !== 'dot' && <span className="sr-only">({badge.label})</span>}
    </>
  )
}
