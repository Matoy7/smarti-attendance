import { useState } from 'react'
import { toTimeOfDay } from '@/lib/time'
import { useNow } from './useNow'
import { useAttendanceDay } from './useAttendanceDay'

/**
 * Attendance day state + actions that also produce a screen-reader
 * announcement, shared by the desktop and mobile attendance screens.
 */
export function useAttendanceFlow() {
  const now = useNow()
  const day = useAttendanceDay(now)
  const [announcement, setAnnouncement] = useState('')

  const clockIn = () => {
    day.clockIn()
    setAnnouncement(`כניסה דווחה בשעה ${toTimeOfDay(new Date())}`)
  }
  const clockOut = () => {
    day.clockOut()
    setAnnouncement(`יציאה דווחה בשעה ${toTimeOfDay(new Date())}. מוצג סיכום היום.`)
  }

  return { now, ...day, clockIn, clockOut, announcement }
}
