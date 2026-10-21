import type { ReactNode } from 'react'
import { Brand } from '@/components/Brand'
import { USER } from '@/lib/profile'
import { asset } from '@/lib/assets'
import { BottomNav } from './BottomNav'
import './mobile.css'

/**
 * Mobile app frame: top bar (brand + profile), scrollable content, persistent bottom navigation.
 * The side drawer (MobileDrawer) currently has no trigger in the header and is not mounted.
 */
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="m-app" dir="rtl">
      <header className="m-topbar">
        <Brand tone="on-light" className="m-topbar-brand" />
        <button className="m-avatar-button" type="button" aria-label={`פרופיל משתמש: ${USER.fullName}`}>
          <img className="avatar" src={asset('assets/e53c0.png')} alt="" />
        </button>
      </header>

      <main className="m-main">{children}</main>

      <BottomNav />
    </div>
  )
}
