import { asset } from '@/lib/assets'
import { formatLongDate, toTimeOfDay } from '@/lib/time'
import { useNow } from '@/hooks/useNow'
import { usePunchState } from '@/hooks/usePunchState'

const USER = { firstName: 'מיכל' }
const LOCATION = {
  name: 'משרדי החברה (תל אביב)',
  address: "ליאונרדו דה וינצ'י 21, תל אביב-יפו, ישראל",
}

/** Attendance (נוכחות) — clock-in / clock-out screen from the Figma export. */
export function AttendancePage() {
  const now = useNow()
  const { punched, toggle } = usePunchState()
  const time = toTimeOfDay(now)
  const label = punched ? 'שעת יציאה' : 'שעת כניסה'

  return (
    <div className="attendance-wrap">
      <header className="greeting">
        <p>{formatLongDate(now)}</p>
        <h1>בוקר טוב, {USER.firstName}</h1>
      </header>

      <section className="attendance-card" aria-labelledby="attendance-title">
        <div className="card-main">
          <h2 id="attendance-title">{label}</h2>
          <time dateTime={time}>{time}</time>
          <button className="punch-button" type="button" onClick={toggle} aria-pressed={punched}>
            <img src={asset('assets/dd2d5.svg')} alt="" />
            <span>{label}</span>
          </button>
          <button className="manual-entry" type="button">
            הכנסה ידנית של שעה
          </button>
        </div>

        <footer className="location-strip">
          <div className="location-copy">
            <strong>מיקום: {LOCATION.name}</strong>
            <span>{LOCATION.address}</span>
          </div>
          <button className="edit-location" type="button" aria-label="ערוך מיקום">
            <img src={asset('assets/7ccc9.svg')} alt="" />
          </button>
        </footer>
      </section>
    </div>
  )
}
