import type { ComponentType } from 'react'
import {
  BriefcaseIcon,
  FolderIcon,
  HelpIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@/components/icons'

type NavItem = { id: string; label: string; Icon: ComponentType<{ size?: number }> }

/** Menu-only destinations, listed below the shared main navigation in the side drawer. */
export const DRAWER_NAV: NavItem[] = [
  { id: 'profile', label: 'פרופיל אישי', Icon: UserIcon },
  { id: 'employment', label: 'פרטי העסקה', Icon: BriefcaseIcon },
  { id: 'entitlements', label: 'מידע על זכאויות', Icon: ShieldCheckIcon },
  { id: 'documents', label: 'מסמכים ואישורים', Icon: FolderIcon },
  { id: 'help', label: 'עזרה ותמיכה', Icon: HelpIcon },
]
