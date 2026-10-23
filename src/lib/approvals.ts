import { useSyncExternalStore } from 'react'
import { findEmployee, loadTeamReports, type ApprovalStatus, type TeamReport } from './teamReports'
import { getAbsences, type Absence } from './absences'

/**
 * Manager decisions (approve / reject) on employees' requests, shared app-wide so every view —
 * the דיווחי עובדים screen, the nav notification badges, the absence report status — sees the same
 * state. Saved in this browser's localStorage (no backend yet) so a decision survives a reload,
 * like the requests it applies to; other tabs follow through the storage event.
 */
type Decisions = Readonly<Record<string, ApprovalStatus>> // "YYYY-MM:requestId" → status

const STORAGE_KEY = 'smartime.decisions.v1'

function read(): Decisions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

let decisions: Decisions = read()
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY && e.key !== null) return
    decisions = read()
    onChange()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onStorage)
  }
}

export function useDecisions(): Decisions {
  return useSyncExternalStore(subscribe, () => decisions)
}

export function decide(month: string, ids: string[], status: Exclude<ApprovalStatus, 'pending'>) {
  if (!ids.length) return
  const next = { ...decisions }
  ids.forEach((id) => (next[`${month}:${id}`] = status))
  decisions = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable: the decision still applies for this session.
  }
  listeners.forEach((l) => l())
}

/** The month a submitted absence is listed under: when it was submitted (when the manager receives it). */
const listedMonth = (a: Absence) => {
  const d = new Date(a.submittedAt)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** A submitted absence's approval status: pending until the manager decides. */
export function absenceStatus(a: Absence, d: Decisions = decisions): ApprovalStatus {
  return d[`${listedMonth(a)}:${a.id}`] ?? 'pending'
}

/** Submitted absences as approval requests, next to the employees' other requests for that month. */
function absenceRequests(month: string, absences: Absence[], d: Decisions): TeamReport[] {
  return absences.flatMap((a) => {
    const employee = findEmployee(a.employeeId)
    if (!employee || listedMonth(a) !== month) return []
    return [{ ...employee, id: a.id, employeeId: a.employeeId, month, refMonth: a.from.slice(0, 7), requestType: a.type, status: absenceStatus(a, d), absence: { from: a.from, to: a.to, note: a.note } }]
  })
}

/** A month's requests with the manager's decisions applied: the demo reports, then submitted absences. */
export function reportsFor(month: string, d: Decisions = decisions, absences: Absence[] = getAbsences()): TeamReport[] {
  return [...loadTeamReports(month).map((r) => ({ ...r, status: d[`${month}:${r.id}`] ?? r.status })), ...absenceRequests(month, absences, d)]
}
