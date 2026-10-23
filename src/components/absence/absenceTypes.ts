import type { ComponentType } from 'react'
import { HelmetIcon, MoreIcon, StethoscopeIcon, UmbrellaIcon } from '@/components/icons'
import { ABSENCE_TYPES, type AbsenceType } from '@/lib/absences'

/** Icon and label per absence type: the report form's cards and the absence lists in הדיווחים שלי. */
export const ABSENCE_ICON: Record<AbsenceType, ComponentType<{ size?: number }>> = {
  sick: StethoscopeIcon,
  vacation: UmbrellaIcon,
  reserve: HelmetIcon,
  other: MoreIcon,
}

export const ABSENCE_LABEL = Object.fromEntries(ABSENCE_TYPES.map((t) => [t.id, t.label])) as Record<AbsenceType, string>
