import { asset } from '@/lib/assets'
import { formatLongDate, toTimeOfDay } from '@/lib/time'
import { LOCATION } from '@/lib/profile'
import { useNow } from '@/hooks/useNow'
import { usePunchState } from '@/hooks/usePunchState'
import { Button, Card, IconButton } from '@/components/ui'
import { ClockIcon } from '@/components/icons'
import { MobileShell } from './MobileShell'

/** Attendance screen — mobile layout. Shares clock-in state with desktop. */
export function MobileAttendance() {
  const now = useNow()
  const { punched, toggle } = usePunchState()
  const time = toTimeOfDay(now)

  return (
    <MobileShell>
      <Card className="m-punch-card" aria-labelledby="m-attendance-title">
        <header className="m-card-header">
          <h1 id="m-attendance-title" className="text-title">
            נוכחות
          </h1>
          <p className="text-body text-secondary">{formatLongDate(now)}</p>
        </header>

        <time className="m-clock text-display" dateTime={time}>
          {time}
        </time>

        <button className="punch-orb" type="button" aria-pressed={punched} onClick={toggle}>
          <ClockIcon size={28} />
          <strong>{punched ? 'סיום עבודה' : 'התחלת עבודה'}</strong>
          <span>{punched ? 'לחץ לדיווח יציאה' : 'לחץ לדיווח כניסה'}</span>
        </button>

        <Button variant="link" className="m-manual-entry text-body">
          הכנסה ידנית של שעה
        </Button>

        <footer className="m-location">
          <span className="m-location-pin" aria-hidden="true">
            <img src={asset('assets/c2539.svg')} alt="" />
          </span>
          <span className="m-location-copy">
            <strong className="text-label">מיקום: {LOCATION.name}</strong>
            <span className="text-caption text-tertiary">{LOCATION.shortAddress}</span>
          </span>
          <IconButton size="touch" label="ערוך מיקום" icon={asset('assets/7ccc9.svg')} />
        </footer>
      </Card>
    </MobileShell>
  )
}
