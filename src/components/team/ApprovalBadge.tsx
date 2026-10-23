import { APPROVAL_LABEL, type ApprovalStatus } from '@/lib/teamReports'
import { CheckIcon, ClockIcon, MinusIcon, XIcon } from '@/components/icons'
import './approval-badge.css'

/** A request's approval status, or "missing": the monthly report was never submitted. */
export type BadgeStatus = ApprovalStatus | 'missing'

const ICON = { approved: CheckIcon, pending: ClockIcon, rejected: XIcon, missing: MinusIcon } as const
const LABEL: Record<BadgeStatus, string> = { ...APPROVAL_LABEL, missing: 'טרם הוגש' }

/**
 * Manager approval status: אושר / ממתין לאישור / נדחה, plus טרם הוגש (neutral) for a report not
 * submitted yet. Icon + color + text, never color alone.
 */
export function ApprovalBadge({ status }: { status: BadgeStatus }) {
  const Icon = ICON[status]
  return (
    <span className={`approval approval-${status}`}>
      <Icon size={14} strokeWidth={2} />
      {LABEL[status]}
    </span>
  )
}
