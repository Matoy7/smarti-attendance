type Props = {
  /** Visible HH:MM text */
  value: string
  /** Machine-readable value for the <time> element (a time of day or an ISO duration) */
  dateTime: string
  className?: string
}

/** The large HH:MM clock / timer: display style, tabular numerals, always laid out LTR. */
export function TimeDisplay({ value, dateTime, className = '' }: Props) {
  return (
    <time className={`time-display text-display ${className}`.trim()} dateTime={dateTime}>
      {value}
    </time>
  )
}
