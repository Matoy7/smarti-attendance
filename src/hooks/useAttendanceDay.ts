import { useCallback, useRef, useState } from 'react'

/**
 * Today's attendance, as work sessions (clock-in → clock-out pairs).
 * No backend yet: kept in this browser's localStorage only.
 *
 * Flow:  idle ──clock in──▶ working ──clock out──▶ summary ──back──▶ idle ──clock in──▶ working …
 * Sessions stay on the day's record after returning to idle, so the day's totals keep accumulating.
 */
export type Session = {
  start: string // ISO timestamps
  end: string | null
  /** The time was entered by hand (הכנסה ידנית של שעה), not punched */
  manualStart?: boolean
  manualEnd?: boolean
}
export type AttendanceStatus = 'idle' | 'working' | 'summary'

type DayRecord = {
  date: string // local YYYY-MM-DD of first clock-in
  sessions: Session[]
  /** The user left the day summary and is back on the clock-in screen */
  summaryDismissed?: boolean
}

const STORAGE_KEY = 'smartime.day.v1'
/** Earlier days, kept when a new day starts: { 'YYYY-MM-DD': sessions } (הדיווחים שלי reads them). */
const ARCHIVE_KEY = 'smartime.days.v1'
const LEGACY_KEY = 'smartime.clockedInAt' // single open clock-in from the first version

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Why an attendance action was not recorded. */
export type AttendanceErrorReason = 'storage' | 'conflict' | 'invalid'

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

function readArchive(): Record<string, Session[]> {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/** Moves a finished day into the archive before a new day's record replaces it. False if the write fails. */
function archive(record: DayRecord): boolean {
  if (!record.sessions.length) return true
  try {
    const next = { ...readArchive(), [record.date]: record.sessions }
    const raw = JSON.stringify(next)
    localStorage.setItem(ARCHIVE_KEY, raw)
    return localStorage.getItem(ARCHIVE_KEY) === raw
  } catch {
    return false
  }
}

/** Every recorded day: the archive plus the current day record (sessions by the day they started on). */
export function readAttendanceHistory(): Record<string, Session[]> {
  const days = readArchive()
  const current = read()
  if (current?.sessions.length) days[current.date] = current.sessions
  return days
}

/** A record belongs to "today" if it is dated today or still has a session running (e.g. past midnight). */
function currentRecord(record: DayRecord | null, now: Date): DayRecord | null {
  if (!record) return null
  const open = record.sessions.some((s) => s.end === null)
  return record.date === dayKey(now) || open ? record : null
}

/** Why a manually entered time can't be recorded (see manualTimeProblem). */
export type ManualTimeProblem =
  | { field: 'date'; code: 'date-range'; min: string; max: string }
  | { field: 'time'; code: 'future' }
  | { field: 'time'; code: 'before-last-out'; bound: Date }
  | { field: 'time'; code: 'before-clock-in'; bound: Date }
  | { field: 'form'; code: 'state' }

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** Dates a manual entry may use (YYYY-MM-DD, inclusive): a clock-in today or yesterday; a clock-out from the clock-in's day to today. */
export function manualDateRange(action: 'in' | 'out', record: DayRecord | null, now: Date): { min: string; max: string } {
  const max = dayKey(now)
  const open = record?.sessions.find((s) => s.end === null)
  if (action === 'out' && open) return { min: dayKey(new Date(open.start)), max }
  const yesterday = startOfDay(now)
  yesterday.setDate(yesterday.getDate() - 1)
  return { min: dayKey(yesterday), max }
}

/**
 * Checks a manually entered clock-in / clock-out time against the day record. Shared by the form
 * (inline errors) and the recorder (which re-checks against the freshest record before saving).
 * - not in the future
 * - clock-in: today or yesterday, after the day's last clock-out (sessions never overlap)
 * - clock-out: after the running session's clock-in
 */
export function manualTimeProblem(action: 'in' | 'out', at: Date, stored: DayRecord | null, now: Date): ManualTimeProblem | null {
  const record = currentRecord(stored, now)
  const open = record?.sessions.find((s) => s.end === null) ?? null
  if ((action === 'in') === Boolean(open)) return { field: 'form', code: 'state' } // clock-in while working, or clock-out while not
  const { min, max } = manualDateRange(action, record, now)
  const day = dayKey(at)
  if (day < min || day > max) return { field: 'date', code: 'date-range', min, max }
  if (at.getTime() > now.getTime()) return { field: 'time', code: 'future' }
  if (action === 'out' && open && at.getTime() <= new Date(open.start).getTime()) return { field: 'time', code: 'before-clock-in', bound: new Date(open.start) }
  const lastEnd = record?.sessions.at(-1)?.end
  if (action === 'in' && lastEnd && at.getTime() <= new Date(lastEnd).getTime()) return { field: 'time', code: 'before-last-out', bound: new Date(lastEnd) }
  return null
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
   * Records a clock-in, now or at a manually entered time (`manualAt`, checked by manualTimeProblem).
   * Resolves with its time once the record is saved and verified; rejects with an AttendanceError
   * and leaves the state unchanged otherwise.
   * Async so a server-backed implementation can replace it without touching the UI.
   */
  const clockIn = useCallback(async (manualAt?: Date): Promise<Date> => {
    const now = new Date()
    const at = manualAt ?? now
    const today = currentRecord(latest(), now)
    if (today?.sessions.some((s) => s.end === null)) {
      apply(today) // already clocked in (e.g. in another tab): show the real state
      throw new AttendanceError('conflict')
    }
    if (manualAt && manualTimeProblem('in', manualAt, today, now)) throw new AttendanceError('invalid')
    const session: Session = manualAt ? { start: at.toISOString(), end: null, manualStart: true } : { start: at.toISOString(), end: null }
    const next: DayRecord = today
      ? { ...today, summaryDismissed: false, sessions: [...today.sessions, session] }
      : { date: dayKey(at), sessions: [session] }
    // A new day replaces the stored record: keep the previous day first.
    const previous = latest()
    if (!today && previous && previous.date !== next.date && !archive(previous)) throw new AttendanceError('storage')
    if (!persist(next)) throw new AttendanceError('storage')
    apply(next)
    return at
  }, [apply, latest])

  /** Records a clock-out (now or at `manualAt`), with the same confirmation contract as clockIn. */
  const clockOut = useCallback(async (manualAt?: Date): Promise<Date> => {
    const now = new Date()
    const at = manualAt ?? now
    const current = latest()
    if (!current?.sessions.some((s) => s.end === null)) {
      apply(current ?? null) // already clocked out elsewhere
      throw new AttendanceError('conflict')
    }
    if (manualAt && manualTimeProblem('out', manualAt, current, now)) throw new AttendanceError('invalid')
    const next: DayRecord = {
      ...current,
      sessions: current.sessions.map((s) => (s.end === null ? { ...s, end: at.toISOString(), ...(manualAt ? { manualEnd: true } : {}) } : s)),
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

  /** Checks a manual time against the freshest record (form validation). */
  const checkManualTime = useCallback((action: 'in' | 'out', at: Date) => manualTimeProblem(action, at, latest(), new Date()), [latest])
  /** Allowed dates for a manual entry right now. */
  const manualDates = useCallback((action: 'in' | 'out') => manualDateRange(action, currentRecord(latest(), new Date()), new Date()), [latest])

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
    checkManualTime,
    manualDates,
  }
}
