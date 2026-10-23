import { useCallback, useMemo, useState } from 'react'
import { APPROVAL_LABEL, formatMonth, monthKey, typeLabel, type ApprovalStatus, type TeamReport } from '@/lib/teamReports'
import { decide as recordDecision, reportsFor, useDecisions } from '@/lib/approvals'
import { downloadFile, toCsv } from '@/lib/exportCsv'

/**
 * Views of the month's reports. pending + processed partition the month (every report is in exactly
 * one of them); all is the full monthly report list.
 */
export type TeamTab = 'pending' | 'processed' | 'all'

/** Tab order (right to left in RTL); the first is the default. Shared by desktop and mobile. */
export const TEAM_TABS: { id: TeamTab; label: string }[] = [
  { id: 'pending', label: 'בקשות לאישור' },
  { id: 'processed', label: 'בקשות שטופלו' },
  { id: 'all', label: 'דיווח חודשי' },
]

const inTab = (tab: TeamTab, status: ApprovalStatus) =>
  tab === 'all' || (tab === 'pending' ? status === 'pending' : status !== 'pending')

/** Empty-state line when a tab has nothing this month (no search or department filter applied). */
export const EMPTY_TAB_MESSAGE: Record<TeamTab, string> = {
  pending: 'אין בקשות שממתינות לאישור בחודש זה.',
  processed: 'עדיין לא טופלו בקשות בחודש זה.',
  all: 'אין דיווחים בחודש זה.',
}
export const ALL_DEPARTMENTS = 'all'

const normalize = (s: string) => s.trim().toLocaleLowerCase('he')

/**
 * דיווחי עובדים — state and actions shared by the desktop table and the mobile list:
 * filters (search, month, department, tab), selection, and manager approve / reject.
 * Approval decisions live in the shared store (lib/approvals.ts), so the nav badges stay in sync.
 */
export function useTeamReports() {
  const [month, setMonthState] = useState(() => monthKey(new Date()))
  const [department, setDepartmentState] = useState(ALL_DEPARTMENTS)
  const [query, setQueryState] = useState('')
  const [tab, setTabState] = useState<TeamTab>(TEAM_TABS[0].id)
  const decisions = useDecisions()
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [announcement, setAnnouncement] = useState('')

  const reports = useMemo<TeamReport[]>(() => reportsFor(month, decisions), [month, decisions])

  const filtered = useMemo(() => {
    const q = normalize(query)
    return reports.filter(
      (r) =>
        inTab(tab, r.status) &&
        (department === ALL_DEPARTMENTS || r.department === department) &&
        (!q || [r.name, r.role, r.department].some((field) => normalize(field).includes(q))),
    )
  }, [reports, tab, department, query])

  const pendingCount = useMemo(() => reports.filter((r) => r.status === 'pending').length, [reports])
  const processedCount = reports.length - pendingCount

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
      recordDecision(month, ids, status)
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

  /** Downloads what the screen shows (view, month, department, search — every page) as a CSV file. */
  const exportCsv = () => {
    if (!filtered.length) return
    const header = ['שם עובד', 'תפקיד', 'מחלקה', 'סוג', 'סטטוס', 'חודש']
    const rows = filtered.map((r) => [r.name, r.role, r.department, typeLabel(r, tab), APPROVAL_LABEL[r.status], formatMonth(r.month)])
    const view = TEAM_TABS.find((x) => x.id === tab)!.label
    const scope = department === ALL_DEPARTMENTS ? '' : ` - ${department}`
    downloadFile(`דיווחי עובדים - ${view}${scope} - ${formatMonth(month)}.csv`, toCsv([header, ...rows]))
    setAnnouncement(`הקובץ יוצא: ${rows.length} עובדים`)
  }

  return {
    exportCsv,
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
    processedCount,
    selected,
    toggle,
    setMany,
    clearSelection: () => setSelected(new Set()),
    approve: (ids: string[]) => decide(ids, 'approved'),
    reject: (ids: string[]) => decide(ids, 'rejected'),
    announcement,
  }
}
