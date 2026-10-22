import { formatLongDate, toTimeOfDay } from '@/lib/time'
import { useAttendanceFlow } from '@/hooks/useAttendanceFlow'
import { Button, Card, PunchButton, TimeDisplay } from '@/components/ui'
import { ClockIcon } from '@/components/icons'
import { WorkingStatus } from '@/components/attendance/WorkingStatus'
import { DaySummary } from '@/components/attendance/DaySummary'
import { LocationRow } from '@/components/attendance/LocationRow'
import { AttendanceFeedback } from '@/components/attendance/AttendanceFeedback'
import { MobileShell } from './MobileShell'

const TITLE_ID = 'm-state-title'

/** Attendance — mobile. States: before clock-in → working → day summary (shared with desktop). */
export function MobileAttendance() {
  const { now, status, firstIn, lastOut, workedMs, clockIn, clockOut, backToAttendance, pending, feedback, dismissFeedback, announcement } =
    useAttendanceFlow()
  const time = toTimeOfDay(now)

  return (
    <MobileShell>
      <Card className="m-punch-card" aria-labelledby="m-attendance-title">
        <header className="m-card-header">
          {/* Page name stays available to screen readers; it is not shown visually. */}
          <h1 id="m-attendance-title" className="sr-only" data-page-title tabIndex={-1}>
            דיווח נוכחות
          </h1>
          <p className="text-body text-secondary">{formatLongDate(now)}</p>
        </header>

        <div className={`m-state m-state-${status} state-enter`} key={status}>
          <AttendanceFeedback feedback={feedback} onDismiss={dismissFeedback} />

          {status === 'idle' && (
            <>
              <TimeDisplay className="m-clock" value={time} dateTime={time} />
              <PunchButton onClick={clockIn} loading={pending === 'in'}>
                {pending === 'in' ? 'מדווח…' : 'דווח כניסה'}
              </PunchButton>
              <Button variant="link" className="m-manual-entry text-body" disabled={pending !== null}>
                הכנסה ידנית של שעה
              </Button>
            </>
          )}

          {status === 'working' && firstIn && (
            <>
              <WorkingStatus firstIn={firstIn} now={now} workedMs={workedMs} titleId={TITLE_ID} />
              <PunchButton onClick={clockOut} loading={pending === 'out'}>
                {pending === 'out' ? 'מדווח…' : 'דווח יציאה'}
              </PunchButton>
            </>
          )}

          {status === 'summary' && firstIn && lastOut && (
            <>
              <DaySummary firstIn={firstIn} lastOut={lastOut} workedMs={workedMs} titleId={TITLE_ID} />
              <Button className="m-state-action" size="lg" block onClick={backToAttendance} icon={<ClockIcon strokeWidth={1.8} />}>
                חזרה למסך נוכחות
              </Button>
            </>
          )}
        </div>

        {/* The day summary does not show the location (mobile). */}
        {status !== 'summary' && <LocationRow variant="tile" />}
      </Card>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </MobileShell>
  )
}
