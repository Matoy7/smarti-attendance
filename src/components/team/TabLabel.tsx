/** Tab text with its record count, e.g. "ממתינים לאישור (9)"; the count is visually secondary. */
export function TabLabel({ label, count }: { label: string; count: number }) {
  return (
    <>
      {label} <span className="tab-count">({count})</span>
    </>
  )
}
