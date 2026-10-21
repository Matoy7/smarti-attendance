import { useCallback, useState, type ReactNode } from 'react'
import { Brand } from '@/components/Brand'
import { IconButton } from '@/components/ui'
import { MenuIcon } from '@/components/icons'
import { USER } from '@/lib/profile'
import { asset } from '@/lib/assets'
import { BottomNav } from './BottomNav'
import { MobileDrawer } from './MobileDrawer'
import './mobile.css'

/** Mobile app frame: top bar, scrollable content, persistent bottom navigation, side drawer. */
export function MobileShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <div className="m-app" dir="rtl">
      <header className="m-topbar">
        <IconButton
          tone="surface"
          size="touch"
          label="תפריט"
          icon={<MenuIcon />}
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
          onClick={() => setMenuOpen(true)}
        />
        <Brand tone="on-light" />
        <button className="m-avatar-button" type="button" aria-label={`פרופיל משתמש: ${USER.fullName}`}>
          <img className="avatar" src={asset('assets/e53c0.png')} alt="" />
        </button>
      </header>

      <main className="m-main">{children}</main>

      <BottomNav />
      <MobileDrawer open={menuOpen} onClose={closeMenu} />
    </div>
  )
}
