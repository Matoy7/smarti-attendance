import { BOTTOM_BAR_IDS, CURRENT_NAV, visibleNavSections } from '@/lib/navigation'

/** Mobile tab bar: the main destinations in the same order as the sidebar, same permission rules. */
export function BottomNav() {
  const items = visibleNavSections()
    .flatMap((section) => section.items)
    .filter((item) => BOTTOM_BAR_IDS.includes(item.id))

  return (
    <nav className="bottom-nav" aria-label="ניווט ראשי">
      <ul className="bottom-nav-list">
        {items.map(({ id, label, shortLabel, Icon }) => {
          const active = id === CURRENT_NAV
          return (
            <li key={id}>
              <button
                type="button"
                className={`bottom-nav-item ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
                data-destination={id}
              >
                <span className="bottom-nav-icon">
                  <Icon size={24} />
                </span>
                <span className="bottom-nav-label">
                  {shortLabel ?? label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
