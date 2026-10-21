import { asset } from '@/lib/assets'
import { USER } from '@/lib/profile'
import { IconButton } from '@/components/ui'
import { Brand } from '@/components/Brand'

/**
 * Only the Attendance screen is implemented so far; the other navigation
 * items are rendered as designed but do not navigate yet.
 */
const navItems = [
  { id: 'attendance', label: 'נוכחות', icon: '026b7.svg' },
  { id: 'absences', label: 'דיווח היעדרויות', icon: '31b6d.svg' },
  { id: 'history', label: 'היסטוריית דיווחים', icon: '57dd6.svg' },
  { id: 'team', label: 'ניהול נוכחות צוות', icon: 'c6c91.svg' },
  { id: 'settings', label: 'הגדרות', icon: '4d602.svg' },
]

const ACTIVE = 'attendance'

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="ניווט ראשי">
      <Brand tone="on-dark" className="sidebar-brand" />

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            className={`nav-item ${item.id === ACTIVE ? 'active' : ''}`}
            key={item.id}
            aria-current={item.id === ACTIVE ? 'page' : undefined}
            type="button"
          >
            <img src={asset(`assets/${item.icon}`)} alt="" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="profile">
          <img className="avatar" src={asset('assets/e53c0.png')} alt="" />
          <div className="profile-copy">
            <strong className="text-label">{USER.fullName}</strong>
            <span className="text-caption">{USER.role}</span>
          </div>
        </div>
        <IconButton className="logout" tone="on-dark" label="התנתק" icon={asset('assets/69bfd.svg')} />
      </div>
    </aside>
  )
}
