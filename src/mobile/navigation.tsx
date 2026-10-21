import type { ComponentType } from 'react'
import {
  BriefcaseIcon,
  CalendarIcon,
  ClockIcon,
  DocumentIcon,
  FolderIcon,
  HelpIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon,
} from '@/components/icons'

type NavItem = { id: string; label: string; Icon: ComponentType<{ size?: number }> }

/** Bottom navigation — primary sections, right to left. */
export const BOTTOM_NAV: NavItem[] = [
  { id: 'attendance', label: 'נוכחות', Icon: ClockIcon },
  { id: 'absences', label: 'היעדרויות', Icon: CalendarIcon },
  { id: 'my-reports', label: 'הדיווחים שלי', Icon: DocumentIcon },
  { id: 'team-reports', label: 'דיווחי עובדים', Icon: UsersIcon },
]

/** Side drawer — secondary destinations (never repeats the bottom navigation). */
export const DRAWER_NAV: NavItem[] = [
  { id: 'profile', label: 'פרופיל אישי', Icon: UserIcon },
  { id: 'employment', label: 'פרטי העסקה', Icon: BriefcaseIcon },
  { id: 'entitlements', label: 'מידע על זכאויות', Icon: ShieldCheckIcon },
  { id: 'documents', label: 'מסמכים ואישורים', Icon: FolderIcon },
  { id: 'help', label: 'עזרה ותמיכה', Icon: HelpIcon },
]

/** Only the attendance section exists so far. */
export const CURRENT_SECTION = 'attendance'
