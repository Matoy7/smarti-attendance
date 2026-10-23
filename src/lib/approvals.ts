import { useSyncExternalStore } from 'react'
import { loadTeamReports, type ApprovalStatus, type TeamReport } from './teamReports'

/**
 * Manager decisions (approve / reject) on employees' reports, shared app-wide so every view —
 * the דיווחי עובדים screen and the nav notification badges — sees the same state.
 * Kept in memory for this session (demo data, no backend yet).
 */
type Decisions = Readonly<Record<string, ApprovalStatus>> // "YYYY-MM:employeeId" → status

let decisions: Decisions = {}
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

export function useDecisions(): Decisions {
  return useSyncExternalStore(subscribe, () => decisions)
}

export function decide(month: string, ids: string[], status: Exclude<ApprovalStatus, 'pending'>) {
  if (!ids.length) return
  const next = { ...decisions }
  ids.forEach((id) => (next[`${month}:${id}`] = status))
  decisions = next
  listeners.forEach((l) => l())
}

/** A month's reports with the manager's decisions applied. */
export function reportsFor(month: string, d: Decisions = decisions): TeamReport[] {
  return loadTeamReports(month).map((r) => ({ ...r, status: d[`${month}:${r.id}`] ?? r.status }))
}
