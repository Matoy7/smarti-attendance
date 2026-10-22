import { USER } from '@/lib/profile'
import { Avatar, IconButton } from '@/components/ui'
import { Brand } from '@/components/Brand'
import { LogoutIcon } from '@/components/icons'
import { NavSections } from '@/components/NavSections'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Brand tone="on-dark" />
        <ThemeToggle tone="on-dark" className="sidebar-action" />
      </div>

      <nav className="sidebar-nav" aria-label="ניווט ראשי">
        <NavSections tone="dark" />
      </nav>

      <div className="sidebar-footer">
        <div className="profile">
          <Avatar tone="on-dark" />
          <div className="profile-copy">
            <strong className="text-label">{USER.fullName}</strong>
            <span className="text-caption">{USER.role}</span>
          </div>
        </div>
        <IconButton className="logout sidebar-action" tone="on-dark" label="התנתק" icon={<LogoutIcon />} />
      </div>
    </aside>
  )
}
