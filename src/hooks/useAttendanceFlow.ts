import { useCallback, useRef, useState } from 'react'
import { toTimeOfDay } from '@/lib/time'
import { useNow } from './useNow'
import { AttendanceError, useAttendanceDay } from './useAttendanceDay'

export type AttendanceAction = 'in' | 'out'

/** Result of the last clock-in / clock-out, shown inside the attendance card. */
export type AttendanceFeedback =
  | { kind: 'success'; action: AttendanceAction; id: number }
  | { kind: 'error'; action: AttendanceAction; reason: 'storage' | 'conflict'; id: number }

/**
 * Attendance day state + actions, shared by the desktop and mobile attendance screens.
 * An action is reported as successful only after the day record confirms it; while it runs
 * `pending` is set and further submissions are ignored.
 */
export function useAttendanceFlow() {
  const now = useNow()
  const day = useAttendanceDay(now)
  const [pending, setPending] = useState<AttendanceAction | null>(null)
  const [feedback, setFeedback] = useState<AttendanceFeedback | null>(null)
  const [announcement, setAnnouncement] = useState('')
  // Synchronous guard: state updates are async, so a fast double click could pass a `pending` check.
  const inFlight = useRef(false)
  const nextId = useRef(0)

  const { clockIn: recordIn, clockOut: recordOut, backToAttendance: leaveSummary } = day

  const run = useCallback(
    async (action: AttendanceAction) => {
      if (inFlight.current) return
      inFlight.current = true
      setPending(action)
      setFeedback(null)
      const id = ++nextId.current
      try {
        const at = await (action === 'in' ? recordIn() : recordOut())
        setFeedback({ kind: 'success', action, id })
        setAnnouncement(
          action === 'in'
            ? `הכניסה דווחה בהצלחה בשעה ${toTimeOfDay(at)}`
            : `היציאה דווחה בהצלחה בשעה ${toTimeOfDay(at)}. מוצג סיכום היום.`,
        )
      } catch (error) {
        const reason = error instanceof AttendanceError ? error.reason : 'storage'
        setFeedback({ kind: 'error', action, reason, id })
        setAnnouncement(feedbackMessage({ kind: 'error', action, reason, id }))
      } finally {
        inFlight.current = false
        setPending(null)
      }
    },
    [recordIn, recordOut],
  )

  const clockIn = useCallback(() => void run('in'), [run])
  const clockOut = useCallback(() => void run('out'), [run])
  const backToAttendance = useCallback(() => {
    setFeedback(null)
    leaveSummary()
  }, [leaveSummary])
  const dismissFeedback = useCallback(() => setFeedback(null), [])

  return { now, ...day, clockIn, clockOut, backToAttendance, pending, feedback, dismissFeedback, announcement }
}

/** User-facing text for a feedback state. */
export function feedbackMessage(feedback: AttendanceFeedback): string {
  if (feedback.kind === 'success') return feedback.action === 'in' ? 'הכניסה דווחה בהצלחה' : 'היציאה דווחה בהצלחה'
  if (feedback.reason === 'conflict') return 'סטטוס הנוכחות עודכן בחלון אחר. המסך מציג עכשיו את המצב העדכני.'
  return feedback.action === 'in'
    ? 'לא הצלחנו לשמור את דיווח הכניסה. נסו שוב.'
    : 'לא הצלחנו לשמור את דיווח היציאה. נסו שוב.'
}
