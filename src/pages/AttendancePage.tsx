import { asset } from '@/lib/assets'
import { formatLongDate, toTimeOfDay } from '@/lib/time'
import { LOCATION, USER } from '@/lib/profile'
import { useNow } from '@/hooks/useNow'
import { usePunchState } from '@/hooks/usePunchState'
import { Button, Card, CardBody, CardFooter, IconButton } from '@/components/ui'
import './attendance.css'

/** Attendance (נוכחות) — desktop clock-in / clock-out screen. */
export function AttendancePage() {
  const now = useNow()
  const { punched, toggle } = usePunchState()
  const time = toTimeOfDay(now)
  const label = punched ? 'שעת יציאה' : 'שעת כניסה'

  return (
    <div className="page">
      <header className="page-header">
        <p className="text-body-lg text-secondary">{formatLongDate(now)}</p>
        <h1 className="text-title">בוקר טוב, {USER.firstName}</h1>
      </header>

      <Card className="punch-card" aria-labelledby="attendance-title">
        <CardBody>
          <h2 id="attendance-title" className="text-heading">
            {label}
          </h2>
          <time className="text-display" dateTime={time}>
            {time}
          </time>
          <Button
            className="punch-action"
            size="lg"
            onClick={toggle}
            aria-pressed={punched}
            icon={<img src={asset('assets/dd2d5.svg')} alt="" />}
          >
            {label}
          </Button>
          <Button variant="link" className="manual-entry text-body">
            הכנסה ידנית של שעה
          </Button>
        </CardBody>

        <CardFooter>
          <div className="location">
            <div className="location-copy">
              <strong className="text-body">מיקום: {LOCATION.name}</strong>
              <span className="text-small text-tertiary">{LOCATION.address}</span>
            </div>
            <IconButton label="ערוך מיקום" icon={asset('assets/7ccc9.svg')} />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
