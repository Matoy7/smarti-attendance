import { useEffect, useMemo, useRef, useState } from 'react'
import { ALL_DEPARTMENTS, useTeamReports, type TeamTab } from '@/hooks/useTeamReports'
import { DEPARTMENTS, formatMonth, recentMonths, typeLabel, type TeamReport } from '@/lib/teamReports'
import { Button } from '@/components/ui'
import { CalendarIcon, CheckIcon, DownloadIcon, MoreIcon, SearchIcon, XIcon } from '@/components/icons'
import { ApprovalBadge } from '@/components/team/ApprovalBadge'
import { EmployeeAvatar } from '@/components/team/EmployeeAvatar'
import { SelectField } from '@/components/team/SelectField'
import { ActionSheet, type SheetAction } from '@/components/team/ActionSheet'
import { onReportClick } from '@/components/team/openReport'
import { MobileShell } from './MobileShell'
import '@/components/team/team.css'
import '@/pages/team-reports.css'
import './team-reports-mobile.css'

const BATCH = 8
const TABS: { id: TeamTab; label: string }[] = [
  { id: 'all', label: 'דיווח חודשי' },
  { id: 'pending', label: 'בקשות לאישור' },
]

/**
 * דיווחי עובדים — mobile. Same data and actions as desktop (useTeamReports), in mobile patterns:
 * card list instead of a table, segmented control, native pickers, an action sheet for
 * approve / reject, and "show more" instead of page numbers. No bulk selection on mobile.
 */
export function MobileTeamReports() {
  const t = useTeamReports()
  const months = useMemo(() => recentMonths(), [])
  const [visible, setVisible] = useState(BATCH)
  const [acting, setActing] = useState<TeamReport | null>(null)
  const lastActed = useRef<string | null>(null)

  // After the sheet closes, focus returns to the ⋯ button that opened it.
  useEffect(() => {
    if (acting) lastActed.current = acting.id
    else if (lastActed.current) {
      document.querySelector<HTMLElement>(`[data-acts-for="${lastActed.current}"]`)?.focus()
      lastActed.current = null
    }
  }, [acting])

  // Filters restart the list from the first batch.
  const filterKey = `${t.query}|${t.month}|${t.department}|${t.tab}`
  const [lastKey, setLastKey] = useState(filterKey)
  if (filterKey !== lastKey) {
    setLastKey(filterKey)
    setVisible(BATCH)
  }

  const shown = t.filtered.slice(0, visible)
  const remaining = t.filtered.length - shown.length

  const sheetActions = (r: TeamReport): SheetAction[] =>
    [
      r.status !== 'approved' && {
        key: 'approve',
        label: 'אישור הדיווח',
        tone: 'success' as const,
        icon: <CheckIcon size={20} strokeWidth={2} />,
        run: () => (t.approve([r.id]), setActing(null)),
      },
      r.status !== 'rejected' && {
        key: 'reject',
        label: 'דחיית הדיווח',
        tone: 'danger' as const,
        icon: <XIcon size={20} strokeWidth={2} />,
        run: () => (t.reject([r.id]), setActing(null)),
      },
    ].filter(Boolean) as SheetAction[]

  return (
    <MobileShell>
      <section className="m-team" aria-labelledby="m-team-title">
        <header className="m-team-header">
          <h1 id="m-team-title" className="text-title" data-page-title tabIndex={-1}>
            דיווחי עובדים
          </h1>
          <Button
            variant="secondary"
            className="m-team-export"
            icon={<DownloadIcon />}
            onClick={t.exportCsv}
            disabled={!t.filtered.length}
            aria-label="ייצוא הרשימה לקובץ CSV"
          >
            ייצוא
          </Button>
        </header>

        <div className="m-team-filters" role="search">
          <span className="search-field m-search">
            <SearchIcon className="search-field-icon" size={20} />
            <input type="search" aria-label="חיפוש עובד" placeholder="חיפוש לפי שם, תפקיד או מחלקה" value={t.query} onChange={(e) => t.setQuery(e.target.value)} enterKeyHint="search" />
          </span>
          <div className="m-team-selects">
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
          </div>
        </div>

        <div className="m-segmented" role="group" aria-label="תצוגה">
          {TABS.map(({ id, label }) => (
            <button key={id} type="button" className={t.tab === id ? 'active' : undefined} aria-pressed={t.tab === id} onClick={() => t.setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        <p className="m-team-count text-label text-secondary" aria-live="polite">
          {t.filtered.length} עובדים
        </p>

        {shown.length > 0 ? (
          <ul className="m-team-list">
            {shown.map((r) => (
              <li key={r.id} className="m-team-item row-link" onClick={(e) => onReportClick(e, r)}>
                <EmployeeAvatar id={r.id} name={r.name} photo={r.photo} />
                <div className="m-team-copy">
                  {/* Keyboard entry point for the card; tapping anywhere on the card does the same. */}
                  <button type="button" className="emp-open m-team-name">
                    {r.name}
                  </button>
                  <span className="text-caption text-secondary">
                    {r.role} · {r.department}
                  </span>
                  <span className="m-team-type text-caption">
                    <span className="text-secondary">סוג: </span>
                    {typeLabel(r, t.tab)}
                  </span>
                  <ApprovalBadge status={r.status} />
                </div>
                <button type="button" className="m-team-more" data-acts-for={r.id} aria-label={`פעולות עבור ${r.name}`} aria-haspopup="dialog" onClick={() => setActing(r)}>
                  <MoreIcon size={22} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="m-team-empty">
            <strong className="text-body">לא נמצאו עובדים</strong>
            <span className="text-label text-tertiary">
              {t.tab === 'pending' && !t.query && t.department === ALL_DEPARTMENTS
                ? 'אין דיווחים שממתינים לאישור בחודש זה.'
                : 'נסו לשנות את החיפוש או את הסינון.'}
            </span>
          </div>
        )}

        {remaining > 0 && (
          <div className="m-team-more-wrap">
            <Button variant="secondary" block className="m-team-load" onClick={() => setVisible((n) => n + BATCH)}>
              הצגת עוד {Math.min(BATCH, remaining)}
            </Button>
            <span className="text-caption text-tertiary">
              מוצגים {shown.length} מתוך {t.filtered.length}
            </span>
          </div>
        )}
      </section>

      {acting && (
        <ActionSheet title={acting.name} actions={sheetActions(acting)} onClose={() => setActing(null)}>
          <span className="action-sheet-context">
            <span className="text-caption text-secondary">
              {typeLabel(acting, t.tab)} ·{' '}
              {acting.role} · {acting.department} · {formatMonth(acting.month)}
            </span>
            <ApprovalBadge status={acting.status} />
          </span>
        </ActionSheet>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {t.announcement}
      </p>
    </MobileShell>
  )
}
