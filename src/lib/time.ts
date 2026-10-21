const pad = (n: number) => String(n).padStart(2, '0')

/** 14:25 */
export const toTimeOfDay = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

const longDate = new Intl.DateTimeFormat('he-IL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** "יום רביעי, 21 באוקטובר 2026" */
export const formatLongDate = (d: Date) => longDate.format(d)

/** 11834000 → "03:17:14" */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60].map(pad).join(':')
}

/** 29280000 → "08:08" (whole minutes) */
export function formatHoursMinutes(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60000))
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}
