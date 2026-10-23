import { useEffect, useMemo, useState } from 'react'
import { readAttendanceHistory } from './useAttendanceDay'
import { useNow } from './useNow'
import { dayKey, useAbsences } from '@/lib/absences'
import { reminderFor, useReminders } from '@/lib/reminders'
import { absenceStatus, monthlyAttendanceStatus, useDecisions } from '@/lib/approvals'
import { buildMonth } from '@/lib/myReports'
import { monthKey, recentMonths } from '@/lib/teamReports'
import { USER } from '@/lib/profile'

/**
 * הדיווחים שלי — state shared by the desktop and mobile screens: the selected month (current by
 * default, back through the same six months the manager reviews), its days, totals, the monthly
 * attendance approval status and the month's absence reports with their own statuses.
 */
export function useMyReports(user = USER) {
  const now = useNow(30_000) // the running session's total stays current
  const months = useMemo(() => recentMonths(), [])
  const [month, setMonth] = useState(months[0])
  const absences = useAbsences()
  const decisions = useDecisions()
  const reminders = useReminders()

  // Attendance is recorded on another screen or tab: re-read on return and on storage changes.
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1)
    window.addEventListener('storage', bump)
    window.addEventListener('focus', bump)
    return () => {
      window.removeEventListener('storage', bump)
      window.removeEventListener('focus', bump)
    }
  }, [])

  const minute = Math.floor(now.getTime() / 60_000)
  const model = useMemo(
    () =>
      buildMonth({
        month,
        employeeId: user.employeeId,
        recorded: readAttendanceHistory(),
        absences,
        statusOf: (a) => absenceStatus(a, decisions),
        now: new Date(minute * 60_000),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [month, user.employeeId, absences, decisions, minute, version],
  )

  const index = months.indexOf(month)
  return {
    month,
    isCurrent: month === monthKey(now),
    /** Older month (‹ on the right in RTL) */
    previous: index < months.length - 1 ? () => setMonth(months[index + 1]) : undefined,
    /** Newer month */
    next: index > 0 ? () => setMonth(months[index - 1]) : undefined,
    toCurrent: () => setMonth(months[0]),
    approval: monthlyAttendanceStatus(user.employeeId, month, decisions),
    /** Day the manager last reminded the user to submit this month's report (when it's still missing) */
    remindedOn: (() => {
      const r = reminderFor(reminders, month, user.employeeId)
      return r ? dayKey(new Date(r.sentAt)) : undefined
    })(),
    ...model,
  }
}
