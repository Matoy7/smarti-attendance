import type { ComponentType } from 'react'
import { formatHoursMinutes, toTimeOfDay } from '@/lib/time'
import { ClockIcon, LoginIcon, LogoutIcon } from '@/components/icons'
import { IconTile } from '@/components/ui'
import './attendance-states.css'

type Props = { firstIn: Date; lastOut: Date; workedMs: number; titleId: string }

/** "Clocked out" state: the day's first clock-in, last clock-out and total worked time. */
export function DaySummary({ firstIn, lastOut, workedMs, titleId }: Props) {
  const rows: { label: string; value: string; Icon: ComponentType<{ size?: number }>; total?: boolean }[] = [
    { label: 'שעת כניסה', value: toTimeOfDay(firstIn), Icon: LoginIcon },
    { label: 'שעת יציאה', value: toTimeOfDay(lastOut), Icon: LogoutIcon },
    { label: 'סה״כ זמן עבודה', value: formatHoursMinutes(workedMs), Icon: ClockIcon, total: true },
  ]

  return (
    <div className="day-summary">
      <h2 id={titleId} className="text-heading">
        סיכום יום
      </h2>
      <dl className="summary-list">
        {rows.map(({ label, value, Icon, total }) => (
          <div className={total ? 'summary-row summary-row-total' : 'summary-row'} key={label}>
            <IconTile icon={<Icon size={18} />} />
            <dt className="text-body text-secondary">{label}</dt>
            <dd className="summary-value text-value">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
