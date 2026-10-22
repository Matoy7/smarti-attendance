import { useCallback, useRef, useState } from 'react'

/**
 * Today's attendance, as work sessions (clock-in → clock-out pairs).
 * No backend yet: kept in this browser's localStorage only.
 *
 * Flow:  idle ──clock in──▶ working ──clock out──▶ summary ──back──▶ idle ──clock in──▶ working …
 * Sessions stay on the day's record after returning to idle, so the day's totals keep accumulating.
 */
export type Session = { start: string; end: string | null } // ISO timestamps
export type AttendanceStatus = 'idle' | 'working' | 'summary'

type DayRecord = {
  date: string // local YYYY-MM-DD of first clock-in
  sessions: Session[]
  /** The user left the day summary and is back on the clock-in screen */
  summaryDismissed?: boolean
}

const STORAGE_KEY = 'smartime.day.v1'
const LEGACY_KEY = 'smartime.clockedInAt' // single open clock-in from the first version

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Why an attendance action was not recorded. */
export type AttendanceErrorReason = 'storage' | 'conflict'

export class AttendanceError extends Error {
  constructor(readonly reason: AttendanceErrorReason) {
    super(reason)
  }
}

/** The stored record, or `undefined` when storage cannot be read at all. */
function read(): DayRecord | null | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DayRecord
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      localStorage.removeItem(LEGACY_KEY)
      return { date: dayKey(new Date(legacy)), sessions: [{ start: legacy, end: null }] }
    }
    return null
  } catch {
    return undefined
  }
}

/** Saves the record and reads it back. Returns true only when the write is confirmed. */
function persist(record: DayRecord): boolean {
  try {
    const raw = JSON.stringify(record)
    localStorage.setItem(STORAGE_KEY, raw)
    return localStorage.getItem(STORAGE_KEY) === raw
  } catch {
    return false
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
  const [stored, setStored] = useState<DayRecord | null>(() => read() ?? null)
  // Latest record, so actions never compute from a stale render.
  const storedRef = useRef(stored)
  const record = currentRecord(stored, now)
  const sessions = record?.sessions ?? []
  const open = sessions.find((s) => s.end === null) ?? null
  const status: AttendanceStatus = open ? 'working' : sessions.length > 0 && !record?.summaryDismissed ? 'summary' : 'idle'

  const apply = useCallback((next: DayRecord | null) => {
    storedRef.current = next
    setStored(next)
  }, [])

  /** The freshest record: storage first (another tab may have changed it), else memory. */
  const latest = useCallback(() => {
    const fromStorage = read()
    return fromStorage === undefined ? storedRef.current : fromStorage
  }, [])

  /**
   * Records a clock-in. Resolves with its time once the record is saved and verified;
   * rejects with an AttendanceError and leaves the state unchanged otherwise.
   * Async so a server-backed implementation can replace it without touching the UI.
   */
  const clockIn = useCallback(async (): Promise<Date> => {
    const at = new Date()
    const today = currentRecord(latest(), at)
    if (today?.sessions.some((s) => s.end === null)) {
      apply(today) // already clocked in (e.g. in another tab): show the real state
      throw new AttendanceError('conflict')
    }
    const next: DayRecord = today
      ? { ...today, summaryDismissed: false, sessions: [...today.sessions, { start: at.toISOString(), end: null }] }
      : { date: dayKey(at), sessions: [{ start: at.toISOString(), end: null }] }
    if (!persist(next)) throw new AttendanceError('storage')
    apply(next)
    return at
  }, [apply, latest])

  /** Records a clock-out, with the same confirmation contract as clockIn. */
  const clockOut = useCallback(async (): Promise<Date> => {
    const at = new Date()
    const current = latest()
    if (!current?.sessions.some((s) => s.end === null)) {
      apply(current ?? null) // already clocked out elsewhere
      throw new AttendanceError('conflict')
    }
    const next: DayRecord = {
      ...current,
      sessions: current.sessions.map((s) => (s.end === null ? { ...s, end: at.toISOString() } : s)),
    }
    if (!persist(next)) throw new AttendanceError('storage')
    apply(next)
    return at
  }, [apply, latest])

  /** Leaves the day summary. A view preference only, so it still works if storage fails. */
  const backToAttendance = useCallback(() => {
    const current = storedRef.current
    if (!current) return
    const next: DayRecord = { ...current, summaryDismissed: true }
    persist(next)
    apply(next)
  }, [apply])

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
    backToAttendance,
  }
}
