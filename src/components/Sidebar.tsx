import { asset } from '@/lib/assets'
import { USER } from '@/lib/profile'
import { IconButton } from '@/components/ui'
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
