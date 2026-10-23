import { useMemo } from 'react'
import type { NavId } from './navigation'
import { reportsFor, useDecisions } from './approvals'
import { employeeOf, monthKey, recentMonths } from './teamReports'
import { useAbsences } from './absences'
import { hasPermission } from './permissions'
import { USER } from './profile'

export type NavBadge = { count: number; label: string }

/**
 * What needs the user's attention, per navigation destination (shown as an orange circle on the
 * sidebar, the mobile menu and the bottom bar). Derived from app state, so it updates live:
 * - דיווחי עובדים: this month's reports waiting for the manager's approval
 * - הדיווחים שלי: the user's own reports (last 6 months) that were rejected and need correcting
 */
export function useNavBadges(user = USER): Partial<Record<NavId, NavBadge>> {
  const decisions = useDecisions()
  const absences = useAbsences()
  return useMemo(() => {
    const badges: Partial<Record<NavId, NavBadge>> = {}
    const months = recentMonths()

    const rejected = months.flatMap((m) => reportsFor(m, decisions, absences)).filter((r) => employeeOf(r) === user.employeeId && r.status === 'rejected').length
    if (rejected) badges['my-reports'] = { count: rejected, label: rejected === 1 ? 'דיווח אחד דורש תיקון' : `${rejected} דיווחים דורשים תיקון` }

    if (hasPermission(user, 'org.attendance.manage')) {
      const pending = reportsFor(monthKey(new Date()), decisions, absences).filter((r) => r.status === 'pending').length
      if (pending) badges['team-reports'] = { count: pending, label: pending === 1 ? 'בקשה אחת ממתינה לאישור' : `${pending} בקשות ממתינות לאישור` }
    }
    return badges
  }, [decisions, absences, user])
}
