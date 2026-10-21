import { formatLongDate, toTimeOfDay } from '@/lib/time'
import { LOCATION, USER } from '@/lib/profile'
import { useAttendanceFlow } from '@/hooks/useAttendanceFlow'
import { Button, Card, CardBody, CardFooter, IconButton } from '@/components/ui'
import { ClockIcon, LoginIcon, LogoutIcon, PencilIcon } from '@/components/icons'
import { WorkingStatus } from '@/components/attendance/WorkingStatus'
import { DaySummary } from '@/components/attendance/DaySummary'
import './attendance.css'

const TITLE_ID = 'attendance-title'

/** Attendance (נוכחות) — desktop. States: before clock-in → working → day summary. */
export function AttendancePage() {
  const { now, status, firstIn, lastOut, workedMs, clockIn, clockOut, announcement } = useAttendanceFlow()
  const time = toTimeOfDay(now)

  return (
    <div className="page">
      <header className="page-header">
        <p className="text-body-lg text-secondary">{formatLongDate(now)}</p>
        <h1 className="text-title">בוקר טוב, {USER.firstName}</h1>
      </header>

      <Card className="punch-card" aria-labelledby={TITLE_ID}>
        <CardBody>
          <div className="state-enter" key={status}>
            {status === 'idle' && (
              <>
                <h2 id={TITLE_ID} className="text-heading">
                  שעת כניסה
                </h2>
                <time className="punch-clock text-display" dateTime={time}>
                  {time}
                </time>
                <Button className="punch-action" size="lg" onClick={clockIn} icon={<ClockIcon strokeWidth={1.8} />}>
                  דווח כניסה
                </Button>
                <Button variant="link" className="manual-entry text-body">
                  הכנסה ידנית של שעה
                </Button>
              </>
            )}

            {status === 'working' && firstIn && (
              <>
                <WorkingStatus firstIn={firstIn} now={now} workedMs={workedMs} titleId={TITLE_ID} />
                <Button className="punch-action" size="lg" onClick={clockOut} icon={<LogoutIcon strokeWidth={1.8} />}>
                  סיום עבודה
                </Button>
              </>
            )}

            {status === 'summary' && firstIn && lastOut && (
              <>
                <DaySummary firstIn={firstIn} lastOut={lastOut} workedMs={workedMs} titleId={TITLE_ID} />
                <Button className="punch-action" size="lg" onClick={clockIn} icon={<LoginIcon strokeWidth={1.8} />}>
                  התחלת עבודה
                </Button>
              </>
            )}
          </div>
        </CardBody>

        <CardFooter>
          <div className="location">
            <IconButton label="ערוך מיקום" icon={<PencilIcon />} />
            <div className="location-copy">
              <strong className="text-body">מיקום: {LOCATION.name}</strong>
              <span className="text-small text-tertiary">{LOCATION.address}</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
}
