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

/** 29280000 → "08:08" (whole minutes) */
export function formatHoursMinutes(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60000))
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

/** Greeting for the time of day: 05–12 morning, 12–17 noon, 17–21 evening, otherwise night. */
export function greetingFor(d: Date): string {
  const h = d.getHours()
  if (h >= 5 && h < 12) return 'בוקר טוב'
  if (h >= 12 && h < 17) return 'צהריים טובים'
  if (h >= 17 && h < 21) return 'ערב טוב'
  return 'לילה טוב'
}
