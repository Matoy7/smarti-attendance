import { useCallback, useMemo, useState } from 'react'
import { APPROVAL_LABEL, loadTeamReports, monthKey, type ApprovalStatus, type TeamReport } from '@/lib/teamReports'

export type TeamTab = 'all' | 'pending'
export const ALL_DEPARTMENTS = 'all'

const normalize = (s: string) => s.trim().toLocaleLowerCase('he')

/**
 * דיווחי עובדים — state and actions shared by the desktop table and the mobile list:
 * filters (search, month, department, tab), selection, and manager approve / reject.
 * Approval changes are kept in memory for now (demo data, no backend).
 */
export function useTeamReports() {
  const [month, setMonthState] = useState(() => monthKey(new Date()))
  const [department, setDepartmentState] = useState(ALL_DEPARTMENTS)
  const [query, setQueryState] = useState('')
  const [tab, setTabState] = useState<TeamTab>('all')
  const [decisions, setDecisions] = useState<Record<string, ApprovalStatus>>({}) // "month:id" → status
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [announcement, setAnnouncement] = useState('')

  const reports = useMemo<TeamReport[]>(
    () => loadTeamReports(month).map((r) => ({ ...r, status: decisions[`${month}:${r.id}`] ?? r.status })),
    [month, decisions],
  )

  const filtered = useMemo(() => {
    const q = normalize(query)
    return reports.filter(
      (r) =>
        (tab === 'all' || r.status === 'pending') &&
        (department === ALL_DEPARTMENTS || r.department === department) &&
        (!q || [r.name, r.role, r.department].some((field) => normalize(field).includes(q))),
    )
  }, [reports, tab, department, query])

  const pendingCount = useMemo(() => reports.filter((r) => r.status === 'pending').length, [reports])

  // Any filter change starts a fresh result set: selection no longer refers to what's shown.
  const resetView = () => setSelected(new Set())
  const setMonth = (v: string) => (setMonthState(v), resetView())
  const setDepartment = (v: string) => (setDepartmentState(v), resetView())
  const setQuery = (v: string) => (setQueryState(v), resetView())
  const setTab = (v: TeamTab) => (setTabState(v), resetView())

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  /** Select / clear a group of rows (e.g. the visible page). */
  const setMany = useCallback((ids: string[], on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)))
      return next
    })
  }, [])

  const decide = useCallback(
    (ids: string[], status: Exclude<ApprovalStatus, 'pending'>) => {
      if (!ids.length) return
      setDecisions((prev) => {
        const next = { ...prev }
        ids.forEach((id) => (next[`${month}:${id}`] = status))
        return next
      })
      setSelected((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
      const verb = status === 'approved' ? 'אושר' : 'נדחה'
      const one = reports.find((r) => r.id === ids[0])
      setAnnouncement(
        ids.length === 1 && one ? `הדיווח של ${one.name} ${verb}` : `${ids.length} דיווחים — ${APPROVAL_LABEL[status]}`,
      )
    },
    [month, reports],
  )

  return {
    month,
    setMonth,
    department,
    setDepartment,
    query,
    setQuery,
    tab,
    setTab,
    reports,
    filtered,
    total: reports.length,
    pendingCount,
    selected,
    toggle,
    setMany,
    clearSelection: () => setSelected(new Set()),
    approve: (ids: string[]) => decide(ids, 'approved'),
    reject: (ids: string[]) => decide(ids, 'rejected'),
    announcement,
  }
}
