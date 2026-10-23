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
 * What a request is for, e.g. "אישור נוכחות 10-26": one soft-orange pill for every type (the
 * product accent), told apart by icon and text — never by traffic-light colors, which belong to
 * the approval status badge next to it.
 */
export function RequestTypeBadge({ type, label }: { type: RequestType; label: string }) {
  const Icon = ICON[type]
  return (
    <span className="request-type">
      <Icon size={14} />
      {label}
    </span>
  )
}
