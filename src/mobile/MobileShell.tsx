import type { ReactNode } from 'react'
import { Brand } from '@/components/Brand'
import { USER } from '@/lib/profile'
import { Avatar } from '@/components/ui'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BottomNav } from './BottomNav'
import './mobile.css'

/**
 * Mobile app frame: top bar (brand + profile), scrollable content, persistent bottom navigation.
 * The side drawer (MobileDrawer) currently has no trigger in the header and is not mounted.
 */
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="m-app" dir="rtl">
      <header className="m-topbar focus-on-canvas">
        <Brand tone="on-light" />
        <div className="m-topbar-actions">
          <ThemeToggle tone="ghost" size="touch" className="m-theme-toggle" />
          <button className="m-avatar-button" type="button" aria-label={`פרופיל משתמש: ${USER.fullName}`}>
            <Avatar tone="on-light" />
          </button>
        </div>
      </header>

      <main className="m-main">{children}</main>

      <BottomNav />
    </div>
  )
}
