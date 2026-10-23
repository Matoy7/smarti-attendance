import type { ComponentType } from 'react'
import { CalendarIcon, ClockIcon, DocumentIcon, SettingsIcon, UsersIcon } from '@/components/icons'
import { hasPermission, type Permission } from './permissions'
import { USER } from './profile'

/**
 * Main navigation, shared by the desktop sidebar, the mobile menu and the
 * mobile bottom bar. Ids are the destinations; lib/router.ts lists which have a screen.
 */
export type NavId = 'attendance' | 'absences' | 'my-reports' | 'settings' | 'team-reports'

export type NavItem = {
  id: NavId
  label: string
  /** Shorter label for the mobile bottom bar */
  shortLabel?: string
  Icon: ComponentType<{ size?: number }>
  /** Opens a form over the current screen instead of navigating (דיווח היעדרות → lib/absences) */
  opensDialog?: boolean
}

export type NavSection = {
  id: 'personal' | 'organization'
  title: string
  /** Section is shown only to users with this permission */
  permission?: Permission
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'personal',
    title: 'איזור אישי',
    items: [
      { id: 'attendance', label: 'דיווח נוכחות', shortLabel: 'נוכחות', Icon: ClockIcon },
      { id: 'absences', label: 'דיווח היעדרות', shortLabel: 'היעדרויות', Icon: CalendarIcon, opensDialog: true },
      { id: 'my-reports', label: 'הדיווחים שלי', Icon: DocumentIcon },
      { id: 'settings', label: 'הגדרות', Icon: SettingsIcon },
    ],
  },
  {
    id: 'organization',
    title: 'איזור מנהל',
    permission: 'org.attendance.manage',
    items: [{ id: 'team-reports', label: 'דיווחי עובדים', Icon: UsersIcon }],
  },
]

/** Destinations available as bottom-bar tabs on mobile (settings lives in the menu). */
export const BOTTOM_BAR_IDS: NavId[] = ['attendance', 'absences', 'my-reports', 'team-reports']

/** Sections the current user may see. */
export function visibleNavSections(user = USER): NavSection[] {
  return NAV_SECTIONS.filter((section) => !section.permission || hasPermission(user, section.permission))
}
