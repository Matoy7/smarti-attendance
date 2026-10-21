import { formatHoursMinutes, toTimeOfDay } from '@/lib/time'
import './attendance-states.css'

type Props = { firstIn: Date; now: Date; workedMs: number; titleId: string }

/** "Working" state: start time, current time, and a live work timer. */
export function WorkingStatus({ firstIn, now, workedMs, titleId }: Props) {
  const elapsed = formatHoursMinutes(workedMs)
  return (
    <div className="working-status">
      <dl className="work-stats">
        <div className="work-stat">
          <dt className="text-label text-secondary">שעת התחלה</dt>
          <dd>
            <time dateTime={firstIn.toISOString()}>{toTimeOfDay(firstIn)}</time>
          </dd>
        </div>
        <div className="work-stat">
          <dt className="text-label text-secondary">שעה נוכחית</dt>
          <dd>
            <time dateTime={toTimeOfDay(now)}>{toTimeOfDay(now)}</time>
          </dd>
        </div>
      </dl>

      <div className="state-divider" role="presentation" />

      <h2 id={titleId} className="elapsed-title text-body text-secondary">
        זמן עבודה עד כה
      </h2>
      <time className="elapsed text-display" dateTime={`PT${Math.floor(workedMs / 60000)}M`}>
        {elapsed}
      </time>
    </div>
  )
}
