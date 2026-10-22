import { formatHoursMinutes, toTimeOfDay } from '@/lib/time'
import { TimeDisplay } from '@/components/ui'
import { ClockIcon, LoginIcon } from '@/components/icons'
import './attendance-states.css'

type Props = { firstIn: Date; now: Date; workedMs: number; titleId: string }

/** "Working" state: start and current time in a tinted panel, then the live work timer as the focal number. */
export function WorkingStatus({ firstIn, now, workedMs, titleId }: Props) {
  const elapsed = formatHoursMinutes(workedMs)
  return (
    <div className="working-status">
      <dl className="work-stats">
        <div className="work-stat">
          <dt className="work-stat-label text-label">
            <LoginIcon size={16} />
            שעת התחלה
          </dt>
          <dd className="text-value-lg">
            <time dateTime={firstIn.toISOString()}>{toTimeOfDay(firstIn)}</time>
          </dd>
        </div>
        <div className="work-stat">
          <dt className="work-stat-label text-label">
            <ClockIcon size={16} />
            שעה נוכחית
          </dt>
          <dd className="text-value-lg">
            <time dateTime={toTimeOfDay(now)}>{toTimeOfDay(now)}</time>
          </dd>
        </div>
      </dl>

      <h2 id={titleId} className="elapsed-title text-body text-secondary">
        זמן עבודה עד כה
      </h2>
      <TimeDisplay className="elapsed" value={elapsed} dateTime={`PT${Math.floor(workedMs / 60000)}M`} />
    </div>
  )
}
