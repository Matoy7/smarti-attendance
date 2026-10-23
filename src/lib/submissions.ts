import { employeeOf, employeesIn, requiresMonthlyReport, type Employee, type TeamReport } from './teamReports'

/**
 * Monthly attendance reports not yet submitted (טרם הוגש).
 *
 * An employee owes a report for a month when they were employed that month and aren't exempt
 * (requiresMonthlyReport). It counts as submitted once a monthly attendance request (אישור נוכחות)
 * exists for them that month — in any status: pending, approved or rejected. Absence requests
 * (vacation, sick, reserve, other) have their own approval and do not stand in for the report.
 */
export function missingReports(month: string, requests: TeamReport[]): Employee[] {
  const submitted = new Set(requests.filter((r) => r.requestType === 'attendance').map(employeeOf))
  return employeesIn(month).filter((e) => requiresMonthlyReport(e, month) && !submitted.has(e.id))
}
