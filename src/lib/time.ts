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
