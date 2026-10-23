import { useSyncExternalStore } from 'react'

/**
 * Absence reports (דיווח היעדרות): full-day absences an employee submits for manager approval.
 * No backend yet: kept in this browser's localStorage (like the attendance day record), and fed
 * into the manager's approval list (lib/approvals.ts → דיווחי עובדים) as pending requests.
 */
export type AbsenceType = 'sick' | 'vacation' | 'reserve' | 'other'

export const ABSENCE_TYPES: { id: AbsenceType; label: string }[] = [
  { id: 'sick', label: 'מחלה' },
  { id: 'vacation', label: 'חופשה' },
  { id: 'reserve', label: 'מילואים' },
  { id: 'other', label: 'אחר' },
]

export type Absence = {
  id: string
  employeeId: string
  type: AbsenceType
  /** First and last day, inclusive (YYYY-MM-DD). Always full days. */
  from: string
  to: string
  note: string
  /** ISO timestamp */
  submittedAt: string
}

export type AbsenceInput = { type: AbsenceType | null; from: string; to: string; note: string }
export type AbsenceErrors = { type?: string; from?: string; to?: string; note?: string }

const STORAGE_KEY = 'smartime.absences.v1'
export const NOTE_MAX = 300
/** How far back / ahead an absence may be reported. */
const PAST_DAYS = 60
const FUTURE_DAYS = 365

const pad = (n: number) => String(n).padStart(2, '0')
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
/** "2026-10-23" → "23.10.2026" */
export const formatDay = (key: string) => `${key.slice(8, 10)}.${key.slice(5, 7)}.${key.slice(0, 4)}`
const parseDay = (key: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]) ? d : null
}
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/** Days in an inclusive range (calendar days, DST-safe). */
export function dayCount(from: string, to: string): number {
  const a = parseDay(from)
  const b = parseDay(to)
  if (!a || !b) return 0
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000) + 1
}

export const daysLabel = (n: number) => (n === 1 ? 'יום אחד' : `${n} ימים`)
export const rangeLabel = (a: Pick<Absence, 'from' | 'to'>) => (a.from === a.to ? formatDay(a.from) : `${formatDay(a.from)}–${formatDay(a.to)}`)

/** Dates the pickers allow. */
export function absenceDateRange(now = new Date()): { min: string; max: string } {
  return { min: dayKey(addDays(now, -PAST_DAYS)), max: dayKey(addDays(now, FUTURE_DAYS)) }
}

// ---- store ----
let cache: Absence[] | null = null
const listeners = new Set<() => void>()

function read(): Absence[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? (JSON.parse(raw) as Absence[]) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function getAbsences(): Absence[] {
  if (!cache) cache = read()
  return cache
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  // Another tab submitted a report.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return
    cache = read()
    onChange()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onStorage)
  }
}

export function useAbsences(): Absence[] {
  return useSyncExternalStore(subscribe, getAbsences)
}

/** Saves the list and reads it back: true only when the write is confirmed. */
function persist(list: Absence[]): boolean {
  try {
    const raw = JSON.stringify(list)
    localStorage.setItem(STORAGE_KEY, raw)
    return localStorage.getItem(STORAGE_KEY) === raw
  } catch {
    return false
  }
}

// ---- validation ----
/**
 * Checks an absence form. `isActive` tells whether an existing report still counts (not rejected),
 * so a new report can't overlap one that is pending or approved.
 */
export function absenceProblems(input: AbsenceInput, employeeId: string, existing: Absence[], isActive: (a: Absence) => boolean, now = new Date()): AbsenceErrors {
  const errors: AbsenceErrors = {}
  if (!input.type) errors.type = 'יש לבחור סוג היעדרות'
  const from = input.from ? parseDay(input.from) : null
  const to = input.to ? parseDay(input.to) : null
  if (!input.from) errors.from = 'יש לבחור תאריך התחלה'
  else if (!from) errors.from = 'תאריך לא תקין'
  if (!input.to) errors.to = 'יש לבחור תאריך סיום'
  else if (!to) errors.to = 'תאריך לא תקין'
  const { min, max } = absenceDateRange(now)
  if (from && (input.from < min || input.from > max)) errors.from = `אפשר לבחור תאריך בין ${formatDay(min)} ל-${formatDay(max)}`
  if (to && !errors.to && (input.to < min || input.to > max)) errors.to = `אפשר לבחור תאריך בין ${formatDay(min)} ל-${formatDay(max)}`
  if (from && to && !errors.from && !errors.to && input.to < input.from) errors.to = 'תאריך הסיום לא יכול להיות לפני תאריך ההתחלה'
  if (input.note.length > NOTE_MAX) errors.note = `ההערה ארוכה מדי (עד ${NOTE_MAX} תווים)`
  if (!errors.from && !errors.to && from && to) {
    const clash = existing.find((a) => a.employeeId === employeeId && isActive(a) && a.from <= input.to && input.from <= a.to)
    if (clash) errors.from = `כבר קיים דיווח היעדרות לתאריכים אלה (${rangeLabel(clash)})`
  }
  return errors
}

export class AbsenceError extends Error {
  constructor(readonly reason: 'storage' | 'invalid') {
    super(reason)
  }
}

/**
 * Submits an absence report: re-validates against the freshest list (another tab may have added
 * one), saves and verifies. Resolves with the saved report; rejects with an AbsenceError otherwise.
 * Async so a server-backed implementation can replace it without touching the form.
 */
export async function submitAbsence(input: AbsenceInput, employeeId: string, isActive: (a: Absence) => boolean): Promise<Absence> {
  const now = new Date()
  const latest = read()
  if (Object.keys(absenceProblems(input, employeeId, latest, isActive, now)).length || !input.type) throw new AbsenceError('invalid')
  const absence: Absence = {
    id: `abs-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    employeeId,
    type: input.type,
    from: input.from,
    to: input.to,
    note: input.note.trim(),
    submittedAt: now.toISOString(),
  }
  const next = [...latest, absence]
  if (!persist(next)) throw new AbsenceError('storage')
  cache = next
  listeners.forEach((l) => l())
  return absence
}

// ---- form visibility (opened from the דיווח היעדרות nav item) ----
let formOpen = false
let returnFocus: HTMLElement | null = null
const formListeners = new Set<() => void>()
const emitForm = () => formListeners.forEach((l) => l())

export function openAbsenceForm() {
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  formOpen = true
  emitForm()
}

export function closeAbsenceForm() {
  formOpen = false
  emitForm()
  const target = returnFocus
  returnFocus = null
  // After the dialog has closed (the page is inert while it is modal).
  requestAnimationFrame(() => target?.isConnected && target.focus())
}

export function useAbsenceFormOpen(): boolean {
  return useSyncExternalStore(
    (l) => {
      formListeners.add(l)
      return () => formListeners.delete(l)
    },
    () => formOpen,
  )
}
