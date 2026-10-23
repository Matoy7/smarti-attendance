import { BOTTOM_BAR_IDS, visibleNavSections } from '@/lib/navigation'
import { navigate, useRoute } from '@/lib/router'
import { useNavBadges } from '@/lib/notifications'
import { NavBadge } from '@/components/NavBadge'

/** Mobile tab bar: the main destinations in the same order as the sidebar, same permission rules. */
export function BottomNav() {
  const items = visibleNavSections()
    .flatMap((section) => section.items)
    .filter((item) => BOTTOM_BAR_IDS.includes(item.id))
  const current = useRoute()
  const badges = useNavBadges()

  return (
    <nav className="bottom-nav" aria-label="ניווט ראשי">
      <ul className="bottom-nav-list">
        {items.map(({ id, label, shortLabel, Icon }) => {
          const active = id === current
          return (
            <li key={id}>
              <button
                type="button"
                className={`bottom-nav-item ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
                data-destination={id}
                onClick={() => navigate(id)}
              >
                <span className="bottom-nav-icon">
                  <Icon size={24} />
                  <NavBadge badge={badges[id]} className="nav-badge-dot" part="dot" />
                </span>
                <span className="bottom-nav-label">
                  {shortLabel ?? label}
                </span>
                {/* Read after the label: "דיווחי עובדים (9 בקשות ממתינות לאישור)" */}
                <NavBadge badge={badges[id]} part="text" />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
