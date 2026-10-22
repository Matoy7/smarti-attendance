import type { MouseEvent } from 'react'
import type { TeamReport } from '@/lib/teamReports'

/**
 * Opens an employee's report. No destination yet: rows (desktop) and cards (mobile) are already
 * clickable so the report detail screen can plug in here.
 */
export function openReport(_report: TeamReport) {}

/** Row / card click → openReport, except clicks on the item's own controls (checkbox, ⋯ menu). */
export function onReportClick(e: MouseEvent, report: TeamReport) {
  if ((e.target as HTMLElement).closest('input, button:not(.emp-open), [role="menu"]')) return
  openReport(report)
}
