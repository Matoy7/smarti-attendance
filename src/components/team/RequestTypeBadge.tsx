import type { ComponentType } from 'react'
import { DocumentCheckIcon, HelmetIcon, MoreIcon, StethoscopeIcon, UmbrellaIcon } from '@/components/icons'
import type { RequestType } from '@/lib/teamReports'
import './request-type-badge.css'

const ICON: Record<RequestType, ComponentType<{ size?: number }>> = {
  attendance: DocumentCheckIcon,
  vacation: UmbrellaIcon,
  sick: StethoscopeIcon,
  reserve: HelmetIcon,
  other: MoreIcon,
}

/**
 * What a request is for, e.g. "אישור נוכחות 10-26": a pill with its own color per type (from the
 * product palette), plus a per-type icon and the text, so types are told apart at a glance and
 * never by color alone. Status badges are square-cornered, so the two don't read as one.
 */
export function RequestTypeBadge({ type, label }: { type: RequestType; label: string }) {
  const Icon = ICON[type]
  return (
    <span className={`request-type request-type-${type}`}>
      <Icon size={14} />
      {label}
    </span>
  )
}
