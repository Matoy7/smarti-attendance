import { useMemo } from 'react'
import type { NavId } from './navigation'
import { reportsFor, useDecisions } from './approvals'
import { monthKey, recentMonths } from './teamReports'
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
  return useMemo(() => {
    const badges: Partial<Record<NavId, NavBadge>> = {}
    const months = recentMonths()

    const rejected = months.filter((m) => reportsFor(m, decisions).find((r) => r.id === user.employeeId)?.status === 'rejected').length
    if (rejected) badges['my-reports'] = { count: rejected, label: rejected === 1 ? 'דיווח אחד דורש תיקון' : `${rejected} דיווחים דורשים תיקון` }

    if (hasPermission(user, 'org.attendance.manage')) {
      const pending = reportsFor(monthKey(new Date()), decisions).filter((r) => r.status === 'pending').length
      if (pending) badges['team-reports'] = { count: pending, label: pending === 1 ? 'בקשה אחת ממתינה לאישור' : `${pending} בקשות ממתינות לאישור` }
    }
    return badges
  }, [decisions, user])
}
