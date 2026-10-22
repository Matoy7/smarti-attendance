import { APPROVAL_LABEL, type ApprovalStatus } from '@/lib/teamReports'
import { CheckIcon, ClockIcon, XIcon } from '@/components/icons'

const ICON = { approved: CheckIcon, pending: ClockIcon, rejected: XIcon } as const

/** Manager approval of an attendance report: אושר / ממתין לאישור / נדחה. Icon + color + text, never color alone. */
export function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const Icon = ICON[status]
  return (
    <span className={`approval approval-${status}`}>
      <Icon size={14} strokeWidth={2} />
      {APPROVAL_LABEL[status]}
    </span>
  )
}
