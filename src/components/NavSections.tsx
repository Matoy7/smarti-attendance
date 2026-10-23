import { Fragment } from 'react'
import { visibleNavSections, type NavId } from '@/lib/navigation'
import { navigate, useRoute } from '@/lib/router'
import { openAbsenceForm } from '@/lib/absences'
import { useNavBadges } from '@/lib/notifications'
import { NavBadge } from './NavBadge'

/**
 * Grouped main navigation (איזור אישי / איזור מנהל). Used by the desktop
 * sidebar (`dark`) and the mobile menu (`light`) so both stay identical.
 */
export function NavSections({ tone, onNavigate }: { tone: 'dark' | 'light'; onNavigate?: (id: NavId) => void }) {
  const sections = visibleNavSections()
  const current = useRoute()
  const badges = useNavBadges()
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
              {section.items.map(({ id, label, Icon, opensDialog }) => {
                const active = id === current
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`nav-item nav-item-${tone} ${active ? 'active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      aria-haspopup={opensDialog ? 'dialog' : undefined}
                      data-destination={id}
                      onClick={() => {
                        if (opensDialog) openAbsenceForm()
                        else navigate(id)
                        onNavigate?.(id)
                      }}
                    >
                      {/* Desktop: the notification dot sits on the icon's corner; the mobile menu keeps it at the item's end. */}
                      <span className="nav-item-icon">
                        <Icon />
                        {tone === 'dark' && <NavBadge badge={badges[id]} className="nav-badge-icon" part="dot" />}
                      </span>
                      <span>{label}</span>
                      {tone === 'dark' ? <NavBadge badge={badges[id]} part="text" /> : <NavBadge badge={badges[id]} />}
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
