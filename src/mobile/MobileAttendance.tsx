import { formatLongDate, toTimeOfDay } from '@/lib/time'
import { LOCATION } from '@/lib/profile'
import { useAttendanceFlow } from '@/hooks/useAttendanceFlow'
import { Button, Card, IconButton } from '@/components/ui'
import { ClockIcon, LogoutIcon, MoreVerticalIcon, PinIcon } from '@/components/icons'
import { WorkingStatus } from '@/components/attendance/WorkingStatus'
import { DaySummary } from '@/components/attendance/DaySummary'
import { MobileShell } from './MobileShell'

const TITLE_ID = 'm-state-title'

/** Attendance — mobile. States: before clock-in → working → day summary (shared with desktop). */
export function MobileAttendance() {
  const { now, status, firstIn, lastOut, workedMs, clockIn, clockOut, backToAttendance, announcement } = useAttendanceFlow()
  const time = toTimeOfDay(now)

  return (
    <MobileShell>
      <Card className="m-punch-card" aria-labelledby="m-attendance-title">
        <header className="m-card-header">
          {/* Page name stays available to screen readers; it is not shown visually. */}
          <h1 id="m-attendance-title" className="sr-only">
            דיווח נוכחות
          </h1>
          <p className="text-body text-secondary">{formatLongDate(now)}</p>
        </header>

        <div className={`m-state m-state-${status} state-enter`} key={status}>
          {status === 'idle' && (
            <>
              <time className="m-clock text-display" dateTime={time}>
                {time}
              </time>
              <button className="punch-orb" type="button" onClick={clockIn}>
                דווח כניסה
              </button>
              <Button variant="link" className="m-manual-entry text-body">
                הכנסה ידנית של שעה
              </Button>
            </>
          )}

          {status === 'working' && firstIn && (
            <>
              <WorkingStatus firstIn={firstIn} now={now} workedMs={workedMs} titleId={TITLE_ID} />
              <Button className="m-state-action" size="lg" block onClick={clockOut} icon={<LogoutIcon strokeWidth={1.8} />}>
                דווח יציאה
              </Button>
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

        <footer className="m-location">
          <span className="m-location-pin" aria-hidden="true">
            <PinIcon size={16} />
          </span>
          <span className="m-location-copy">
            <strong className="text-caption">מיקום: {LOCATION.name}</strong>
            <span className="text-micro text-tertiary">{LOCATION.shortAddress}</span>
          </span>
          {/* Entry point for changing the work location (no location picker yet). */}
          <IconButton className="m-location-more" size="touch" label="שינוי מיקום" icon={<MoreVerticalIcon />} />
        </footer>
      </Card>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </MobileShell>
  )
}
