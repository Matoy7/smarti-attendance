import { asset } from '@/lib/assets'
import { formatLongDate, toTimeOfDay } from '@/lib/time'
import { LOCATION, USER } from '@/lib/profile'
import { useNow } from '@/hooks/useNow'
import { usePunchState } from '@/hooks/usePunchState'
import './mobile.css'

/**
 * Attendance screen — mobile layout from the mobile Figma export, restyled with
 * the desktop design system (Assistant, navy palette, desktop brand and icons).
 * Shares clock-in state with the desktop layout.
 */
export function MobileAttendance() {
  const now = useNow()
  const { punched, toggle } = usePunchState()
  const time = toTimeOfDay(now)

  return (
    <div className="m-page" dir="rtl">
      <div className="m-shell">
        <header className="m-topbar">
          <button className="m-icon-button" type="button" aria-label="תפריט">
            <img src={asset('assets/3f1d9.svg')} alt="" />
          </button>

          <a className="m-brand" href="#" aria-label="SMARTI Time">
            <span className="m-brand-mark" aria-hidden="true">
              <span />
            </span>
            <span>SMARTI&nbsp; Time</span>
          </a>

          <button className="m-icon-button m-avatar-button" type="button" aria-label={`פרופיל משתמש: ${USER.fullName}`}>
            <img src={asset('assets/e53c0.png')} alt="" />
          </button>
        </header>

        <main className="m-main">
          <section className="m-card" aria-labelledby="m-attendance-title">
            <header className="m-card-heading">
              <h1 id="m-attendance-title">נוכחות</h1>
              <p>{formatLongDate(now)}</p>
            </header>

            <time className="m-clock" dateTime={time}>
              {time}
            </time>

            <div className="m-divider" />

            <div className="m-action-wrap">
              <button className="m-action" type="button" aria-pressed={punched} onClick={toggle}>
                <img src={asset('assets/dd2d5.svg')} alt="" />
                <strong>{punched ? 'סיום עבודה' : 'התחלת עבודה'}</strong>
                <span>{punched ? 'לחץ לדיווח יציאה' : 'לחץ לדיווח כניסה'}</span>
              </button>
            </div>

            <button className="m-manual-entry" type="button">
              הכנסה ידנית של שעה
            </button>

            <footer className="m-location">
              <div className="m-location-info">
                <span className="m-pin">
                  <img src={asset('assets/c2539.svg')} alt="" />
                </span>
                <span className="m-location-copy">
                  <strong>מיקום: {LOCATION.name}</strong>
                  <span>{LOCATION.shortAddress}</span>
                </span>
              </div>
              <button className="m-edit-location" type="button" aria-label="ערוך מיקום">
                <img src={asset('assets/7ccc9.svg')} alt="" />
              </button>
            </footer>
          </section>
        </main>
      </div>
    </div>
  )
}
