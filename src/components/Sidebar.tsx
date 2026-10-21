import { asset } from '@/lib/assets'
import { USER } from '@/lib/profile'
import { IconButton } from '@/components/ui'
import { Brand } from '@/components/Brand'
import { CalendarIcon, ClockIcon, DocumentIcon, LogoutIcon, SettingsIcon, UsersIcon } from '@/components/icons'

/**
 * Only the Attendance screen is implemented so far; the other navigation
 * items are rendered as designed but do not navigate yet.
 */
const navItems = [
  { id: 'attendance', label: 'נוכחות', Icon: ClockIcon },
  { id: 'absences', label: 'דיווח היעדרויות', Icon: CalendarIcon },
  { id: 'history', label: 'היסטוריית דיווחים', Icon: DocumentIcon },
  { id: 'team', label: 'ניהול נוכחות צוות', Icon: UsersIcon },
  { id: 'settings', label: 'הגדרות', Icon: SettingsIcon },
]

const ACTIVE = 'attendance'

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="ניווט ראשי">
      <Brand tone="on-dark" className="sidebar-brand" />

      <nav className="sidebar-nav">
        {navItems.map(({ Icon, ...item }) => (
          <button
            className={`nav-item ${item.id === ACTIVE ? 'active' : ''}`}
            key={item.id}
            aria-current={item.id === ACTIVE ? 'page' : undefined}
            type="button"
          >
            <Icon />
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
        <IconButton className="logout" tone="on-dark" label="התנתק" icon={<LogoutIcon />} />
      </div>
    </aside>
  )
}
