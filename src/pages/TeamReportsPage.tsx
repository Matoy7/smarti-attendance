import { useEffect, useMemo, useRef, useState } from 'react'
import { ALL_DEPARTMENTS, EMPTY_TAB_MESSAGE, TEAM_TABS, useTeamReports } from '@/hooks/useTeamReports'
import { DEPARTMENTS, formatMonth, recentMonths, typeLabel } from '@/lib/teamReports'
import { Button, Card } from '@/components/ui'
import { CalendarIcon, CheckIcon, ChevronIcon, DownloadIcon, SearchIcon, XIcon } from '@/components/icons'
import { ApprovalBadge } from '@/components/team/ApprovalBadge'
import { EmployeeAvatar } from '@/components/team/EmployeeAvatar'
import { RowActionsMenu } from '@/components/team/RowActionsMenu'
import { SelectField } from '@/components/team/SelectField'
import { TabLabel } from '@/components/team/TabLabel'
import { onReportClick } from '@/components/team/openReport'
import '@/components/team/team.css'
import './team-reports.css'

const PAGE_SIZES = [8, 16, 24]

/** Page numbers to show: all when few, otherwise first, last and a window around the current page. */
function pageList(current: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const set = new Set([1, count, current - 1, current, current + 1].filter((n) => n >= 1 && n <= count))
  const sorted = [...set].sort((a, b) => a - b)
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? ['…' as const, n] : [n]))
}

/** דיווחי עובדים — desktop. Managers review each employee's monthly attendance report and approve or reject it. */
export function TeamReportsPage() {
  const t = useTeamReports()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const months = useMemo(() => recentMonths(), [])

  const pageCount = Math.max(1, Math.ceil(t.filtered.length / pageSize))
  const current = Math.min(page, pageCount)
  const rows = t.filtered.slice((current - 1) * pageSize, current * pageSize)
  const first = t.filtered.length ? (current - 1) * pageSize + 1 : 0
  const last = Math.min(current * pageSize, t.filtered.length)

  // Filters start again from page 1.
  useEffect(() => setPage(1), [t.query, t.month, t.department, t.tab, pageSize])

  const pageIds = rows.map((r) => r.id)
  const pageSelected = pageIds.filter((id) => t.selected.has(id)).length
  const allOnPage = pageIds.length > 0 && pageSelected === pageIds.length
  const headerCheck = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (headerCheck.current) headerCheck.current.indeterminate = pageSelected > 0 && !allOnPage
  }, [pageSelected, allOnPage])

  const selectedIds = [...t.selected]

  return (
    <div className="page page-wide">
      <header className="page-header">
        <h1 className="text-title" data-page-title tabIndex={-1}>
          דיווחי עובדים
        </h1>
      </header>

      <div className="team-toolbar" role="search">
        <span className="search-field">
          <SearchIcon className="search-field-icon" size={20} />
          <input
            type="search"
            aria-label="חיפוש עובד"
            placeholder="חיפוש עובד לפי שם, תפקיד או מחלקה"
            value={t.query}
            onChange={(e) => t.setQuery(e.target.value)}
          />
        </span>
        <SelectField
          label="חודש הדיווח"
          value={t.month}
          onChange={t.setMonth}
          icon={<CalendarIcon size={18} />}
          options={months.map((m) => ({ value: m, label: formatMonth(m) }))}
        />
        <SelectField
          label="מחלקה"
          value={t.department}
          onChange={t.setDepartment}
          options={[{ value: ALL_DEPARTMENTS, label: 'כל המחלקות' }, ...DEPARTMENTS.map((d) => ({ value: d, label: d }))]}
        />
        <Button
          variant="secondary"
          className="team-export"
          icon={<DownloadIcon />}
          onClick={t.exportCsv}
          disabled={!t.filtered.length}
          title="הורדת הרשימה המוצגת כקובץ CSV (נפתח ב-Excel)"
        >
          ייצוא
        </Button>
      </div>

      <div className="team-tabs" role="group" aria-label="תצוגה">
        {TEAM_TABS.map(({ id, label }) => (
          <button key={id} type="button" className={`team-tab ${t.tab === id ? 'active' : ''}`} aria-pressed={t.tab === id} onClick={() => t.setTab(id)}>
            <TabLabel label={label} count={t.tabCounts[id]} />
          </button>
        ))}
      </div>

      <Card className="team-card" aria-label="רשימת עובדים">
        {selectedIds.length > 0 && (
          <div className="bulk-bar" role="region" aria-label="פעולות על עובדים שנבחרו">
            <span className="text-label">נבחרו {selectedIds.length} עובדים</span>
            <Button variant="secondary" className="bulk-action bulk-approve" icon={<CheckIcon strokeWidth={2} />} onClick={() => t.approve(selectedIds)}>
              אישור
            </Button>
            <Button variant="secondary" className="bulk-action bulk-reject" icon={<XIcon strokeWidth={2} />} onClick={() => t.reject(selectedIds)}>
              דחייה
            </Button>
            <Button variant="link" className="bulk-clear text-label" onClick={t.clearSelection}>
              ניקוי בחירה
            </Button>
          </div>
        )}

        <div className="table-scroll">
          <table className="team-table">
            <thead>
              <tr>
                <th className="col-check" scope="col">
                  <input
                    ref={headerCheck}
                    type="checkbox"
                    className="check"
                    aria-label="בחירת כל העובדים בעמוד"
                    checked={allOnPage}
                    disabled={!pageIds.length}
                    onChange={(e) => t.setMany(pageIds, e.target.checked)}
                  />
                </th>
                <th scope="col">שם עובד</th>
                <th scope="col">תפקיד</th>
                <th scope="col">מחלקה</th>
                <th scope="col" className="col-type">
                  סוג
                </th>
                <th scope="col" className="col-status">
                  סטטוס
                </th>
                <th scope="col" className="col-actions">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const checked = t.selected.has(r.id)
                return (
                  <tr key={r.id} className={`row-link ${checked ? 'selected' : ''}`.trim()} onClick={(e) => onReportClick(e, r)}>
                    <td className="col-check">
                      <input type="checkbox" className="check" aria-label={`בחירת ${r.name}`} checked={checked} onChange={() => t.toggle(r.id)} />
                    </td>
                    <th scope="row" className="col-name">
                      {/* The keyboard entry point for the row; a mouse click anywhere on the row does the same. */}
                      <button type="button" className="emp-open emp-cell">
                        <EmployeeAvatar id={r.id} name={r.name} photo={r.photo} />
                        <span className="emp-name">{r.name}</span>
                      </button>
                    </th>
                    <td>{r.role}</td>
                    <td>{r.department}</td>
                    <td className="col-type">{typeLabel(r)}</td>
                    <td className="col-status">
                      <ApprovalBadge status={r.status} />
                    </td>
                    <td className="col-actions">
                      <RowActionsMenu name={r.name} status={r.status} onApprove={() => t.approve([r.id])} onReject={() => t.reject([r.id])} />
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="team-empty">
                    <strong className="text-body">לא נמצאו עובדים</strong>
                    <span className="text-label text-tertiary">
                      {!t.query && t.department === ALL_DEPARTMENTS ? EMPTY_TAB_MESSAGE[t.tab] : 'נסו לשנות את החיפוש או את הסינון.'}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="team-footer">
          <div className="team-range">
            <SelectField
              className="page-size"
              label="עובדים בעמוד"
              value={String(pageSize)}
              onChange={(v) => setPageSize(Number(v))}
              options={PAGE_SIZES.map((n) => ({ value: String(n), label: String(n) }))}
            />
            <span className="text-label text-secondary" aria-live="polite">
              מציג {first}–{last} מתוך {t.filtered.length} עובדים
            </span>
          </div>

          {pageCount > 1 && (
            <nav className="pager" aria-label="עמודים">
              <button type="button" className="pager-btn" aria-label="העמוד הקודם" disabled={current === 1} onClick={() => setPage(current - 1)}>
                <ChevronIcon className="icon-flip" size={18} />
              </button>
              {pageList(current, pageCount).map((n, i) =>
                n === '…' ? (
                  <span key={`gap-${i}`} className="pager-gap" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    className={`pager-btn ${n === current ? 'active' : ''}`}
                    aria-label={`עמוד ${n}`}
                    aria-current={n === current ? 'page' : undefined}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ),
              )}
              <button type="button" className="pager-btn" aria-label="העמוד הבא" disabled={current === pageCount} onClick={() => setPage(current + 1)}>
                <ChevronIcon size={18} />
              </button>
            </nav>
          )}
        </footer>
      </Card>

      <p className="sr-only" role="status" aria-live="polite">
        {t.announcement}
      </p>
    </div>
  )
}
