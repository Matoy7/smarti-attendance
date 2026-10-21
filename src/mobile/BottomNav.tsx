import { BOTTOM_NAV, CURRENT_SECTION } from './navigation'

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="ניווט ראשי">
      <ul className="bottom-nav-list">
        {BOTTOM_NAV.map(({ id, label, Icon }) => {
          const active = id === CURRENT_SECTION
          return (
            <li key={id}>
              <button
                type="button"
                className={`bottom-nav-item ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="bottom-nav-icon">
                  <Icon size={24} />
                </span>
                <span className="bottom-nav-label">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
