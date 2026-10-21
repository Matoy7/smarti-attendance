import { useCallback, useState } from 'react'

/**
 * Today's attendance, as work sessions (clock-in → clock-out pairs).
 * No backend yet: kept in this browser's localStorage only.
 *
 * Flow:  idle ──clock in──▶ working ──clock out──▶ summary ──clock in──▶ working …
 */
export type Session = { start: string; end: string | null } // ISO timestamps
export type AttendanceStatus = 'idle' | 'working' | 'summary'

type DayRecord = { date: string; sessions: Session[] } // date = local YYYY-MM-DD of first clock-in

const STORAGE_KEY = 'smartime.day.v1'
const LEGACY_KEY = 'smartime.clockedInAt' // single open clock-in from the first version

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function read(): DayRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DayRecord
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      localStorage.removeItem(LEGACY_KEY)
      return { date: dayKey(new Date(legacy)), sessions: [{ start: legacy, end: null }] }
    }
  } catch {
    // Storage unavailable or corrupt: start fresh.
  }
  return null
}

function write(record: DayRecord | null) {
  try {
    if (record) localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable: state still works in memory.
  }
}

/** A record belongs to "today" if it is dated today or still has a session running (e.g. past midnight). */
function currentRecord(record: DayRecord | null, now: Date): DayRecord | null {
  if (!record) return null
  const open = record.sessions.some((s) => s.end === null)
  return record.date === dayKey(now) || open ? record : null
}

export function workedMs(sessions: Session[], now: Date): number {
  return sessions.reduce((sum, s) => {
    const end = s.end ? new Date(s.end).getTime() : now.getTime()
    return sum + Math.max(0, end - new Date(s.start).getTime())
  }, 0)
}

export function useAttendanceDay(now: Date) {
  const [stored, setStored] = useState<DayRecord | null>(read)
  const record = currentRecord(stored, now)
  const sessions = record?.sessions ?? []
  const open = sessions.find((s) => s.end === null) ?? null
  const status: AttendanceStatus = open ? 'working' : sessions.length > 0 ? 'summary' : 'idle'

  const clockIn = useCallback(() => {
    setStored((prev) => {
      const at = new Date()
      const today = currentRecord(prev, at)
      if (today?.sessions.some((s) => s.end === null)) return prev
      const next: DayRecord = today
        ? { ...today, sessions: [...today.sessions, { start: at.toISOString(), end: null }] }
        : { date: dayKey(at), sessions: [{ start: at.toISOString(), end: null }] }
      write(next)
      return next
    })
  }, [])

  const clockOut = useCallback(() => {
    setStored((prev) => {
      if (!prev) return prev
      const at = new Date().toISOString()
      const next: DayRecord = { ...prev, sessions: prev.sessions.map((s) => (s.end === null ? { ...s, end: at } : s)) }
      write(next)
      return next
    })
  }, [])

  return {
    status,
    /** Start of the session currently running */
    sessionStart: open ? new Date(open.start) : null,
    /** First clock-in of the day */
    firstIn: sessions[0] ? new Date(sessions[0].start) : null,
    /** Last clock-out of the day */
    lastOut: !open && sessions.length ? new Date(sessions[sessions.length - 1].end as string) : null,
    /** Total worked today, including the running session */
    workedMs: workedMs(sessions, now),
    clockIn,
    clockOut,
  }
}
