import type { ComponentType } from 'react'
import { formatHoursMinutes, toTimeOfDay } from '@/lib/time'
import { ClockIcon, LoginIcon, LogoutIcon } from '@/components/icons'
import './attendance-states.css'

type Props = { firstIn: Date; lastOut: Date; workedMs: number; titleId: string }

/** "Clocked out" state: the day's first clock-in, last clock-out and total worked time. */
export function DaySummary({ firstIn, lastOut, workedMs, titleId }: Props) {
  const rows: { label: string; value: string; Icon: ComponentType<{ size?: number }> }[] = [
    { label: 'שעת כניסה', value: toTimeOfDay(firstIn), Icon: LoginIcon },
    { label: 'שעת יציאה', value: toTimeOfDay(lastOut), Icon: LogoutIcon },
    { label: 'סה״כ זמן עבודה', value: formatHoursMinutes(workedMs), Icon: ClockIcon },
  ]

  return (
    <div className="day-summary">
      <h2 id={titleId} className="text-heading">
        סיכום יום
      </h2>
      <dl className="summary-list">
        {rows.map(({ label, value, Icon }) => (
          <div className="summary-row" key={label}>
            <span className="summary-icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <dt className="text-body text-secondary">{label}</dt>
            <dd className="summary-value">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
