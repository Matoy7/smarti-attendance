import type { AttendanceStatus } from '@/hooks/useAttendanceDay'

const LABELS: Record<AttendanceStatus, string> = {
  idle: 'לא במשמרת',
  working: 'במשמרת',
  summary: 'המשמרת הסתיימה',
}

/** Current attendance state at a glance: idle (lavender), working (green, live), day summary (pastel blue). */
export function StatusPill({ status, className = '' }: { status: AttendanceStatus; className?: string }) {
  return (
    <p className={`status-pill status-pill-${status} ${className}`.trim()}>
      <span className="status-dot" aria-hidden="true" />
      <span className="sr-only">סטטוס נוכחות: </span>
      {LABELS[status]}
    </p>
  )
}
