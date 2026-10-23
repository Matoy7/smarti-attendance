import type { ReactNode } from 'react'
import { Brand } from '@/components/Brand'
import { USER } from '@/lib/profile'
import { Avatar } from '@/components/ui'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BottomNav } from './BottomNav'
import './mobile.css'

/**
 * Mobile app frame: top bar (brand + profile), scrollable content, persistent bottom navigation.
 * The content area always fills the height between the top bar and the bottom navigation.
 * `fit`: a single-card screen (attendance) whose card stretches to that height, so the screen
 * fits the viewport without scrolling whenever its content allows (it still scrolls if not).
 * The side drawer (MobileDrawer) currently has no trigger in the header and is not mounted.
 */
export function MobileShell({ children, fit = false, className = '' }: { children: ReactNode; fit?: boolean; className?: string }) {
  return (
    <div className={`m-app ${className}`.trim()} dir="rtl">
      <header className="m-topbar focus-on-canvas">
        <Brand tone="on-light" />
        <div className="m-topbar-actions">
          <ThemeToggle tone="ghost" size="touch" className="m-theme-toggle" />
          <button className="m-avatar-button" type="button" aria-label={`פרופיל משתמש: ${USER.fullName}`}>
            <Avatar tone="on-light" />
          </button>
        </div>
      </header>

      <main className={`m-main ${fit ? 'm-main-fit' : ''}`}>{children}</main>

      <BottomNav />
    </div>
  )
}
