import { USER } from '@/lib/profile'
import { Avatar, IconButton } from '@/components/ui'
import { Brand } from '@/components/Brand'
import { LogoutIcon } from '@/components/icons'
import { NavSections } from '@/components/NavSections'

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Brand tone="on-dark" className="sidebar-brand" />

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
        <IconButton className="logout" tone="on-dark" label="התנתק" icon={<LogoutIcon />} />
      </div>
    </aside>
  )
}
