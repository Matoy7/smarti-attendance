import { Fragment } from 'react'
import { visibleNavSections, type NavId } from '@/lib/navigation'
import { navigate, useRoute } from '@/lib/router'

/**
 * Grouped main navigation (אזור אישי / ניהול ארגוני). Used by the desktop
 * sidebar (`dark`) and the mobile menu (`light`) so both stay identical.
 */
export function NavSections({ tone, onNavigate }: { tone: 'dark' | 'light'; onNavigate?: (id: NavId) => void }) {
  const sections = visibleNavSections()
  const current = useRoute()
  return (
    <>
      {sections.map((section, index) => (
        <Fragment key={section.id}>
          {index > 0 && <hr className={`nav-divider nav-divider-${tone}`} />}
          <div className={`nav-section nav-section-${tone}`} role="group" aria-labelledby={`nav-${tone}-${section.id}`}>
            <h2 id={`nav-${tone}-${section.id}`} className="nav-section-title">
              {section.title}
            </h2>
            <ul className="nav-section-list">
              {section.items.map(({ id, label, Icon }) => {
                const active = id === current
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`nav-item nav-item-${tone} ${active ? 'active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      data-destination={id}
                      onClick={() => {
                        navigate(id)
                        onNavigate?.(id)
                      }}
                    >
                      <Icon />
                      <span>{label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </Fragment>
      ))}
    </>
  )
}
