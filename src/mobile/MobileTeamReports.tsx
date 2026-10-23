import { useEffect, useMemo, useRef, useState } from 'react'
import { ALL_DEPARTMENTS, EMPTY_TAB_MESSAGE, STATUS_OPTIONS, TEAM_TABS, TYPE_OPTIONS, useTeamReports, type StatusFilter } from '@/hooks/useTeamReports'
import { DEPARTMENTS, employeeOf, formatMonth, recentMonths, typeLabel, type TeamReport } from '@/lib/teamReports'
import { Button } from '@/components/ui'
import { CalendarIcon, CheckIcon, DownloadIcon, MoreIcon, SearchIcon, XIcon } from '@/components/icons'
import { ApprovalBadge } from '@/components/team/ApprovalBadge'
import { EmployeeAvatar } from '@/components/team/EmployeeAvatar'
import { SelectField } from '@/components/team/SelectField'
import { TabLabel } from '@/components/team/TabLabel'
import { RequestTypeBadge } from '@/components/team/RequestTypeBadge'
import { MultiSelectField } from '@/components/team/MultiSelectField'
import { RemindAll, RemindButton, ReminderBanner, ReminderSent, useReminderActions } from '@/components/team/reminders'
import { ActionSheet, type SheetAction } from '@/components/team/ActionSheet'
import { onReportClick } from '@/components/team/openReport'
import { MobileShell } from './MobileShell'
import '@/components/team/team.css'
import '@/pages/team-reports.css'
import './team-reports-mobile.css'

const BATCH = 8

/**
 * דיווחי עובדים — mobile. Same data and actions as desktop (useTeamReports), in mobile patterns:
 * card list instead of a table, segmented control, native pickers, an action sheet for
 * approve / reject, and "show more" instead of page numbers. No bulk selection on mobile.
 * טרם הוגש: employee cards with a reminder button each, and "remind everyone" with confirmation.
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
  const filterKey = `${t.query}|${t.month}|${t.department}|${t.status}|${[...t.types].join()}|${t.tab}`
  const [lastKey, setLastKey] = useState(filterKey)
  if (filterKey !== lastKey) {
    setLastKey(filterKey)
    setVisible(BATCH)
  }

  const missingTab = t.tab === 'missing'
  const reminders = useReminderActions(t.remind, t.missing, t.month)
  const shown = t.filtered.slice(0, visible)
  const shownMissing = t.missing.slice(0, visible)
  const listLength = missingTab ? t.missing.length : t.filtered.length
  const remaining = listLength - (missingTab ? shownMissing.length : shown.length)

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
            disabled={!t.shownCount}
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
            <SelectField label="סטטוס" value={t.status} onChange={(v) => t.setStatus(v as StatusFilter)} options={STATUS_OPTIONS} />
            <MultiSelectField label="סוג בקשה" allLabel="כל סוגי הבקשות" options={TYPE_OPTIONS} selected={t.types} onChange={t.setTypes} />
          </div>
        </div>

        <div className="m-segmented" role="group" aria-label="תצוגה">
          {TEAM_TABS.map(({ id, label }) => (
            <button key={id} type="button" className={t.tab === id ? 'active' : undefined} aria-pressed={t.tab === id} onClick={() => t.setTab(id)}>
              <TabLabel label={label} count={t.tabCounts[id]} />
            </button>
          ))}
        </div>

        <div className="m-team-count-row">
          <p className="m-team-count text-label text-secondary" aria-live="polite">
            {listLength} עובדים
          </p>
          {t.filtersActive && (
            <Button variant="link" className="m-team-clear text-label" onClick={t.clearFilters}>
              ניקוי סינון
            </Button>
          )}
        </div>

        {missingTab && (
          <>
            <RemindAll actions={reminders} rows={t.missing} month={t.month} variant="drawer" />
            <ReminderBanner banner={reminders.banner} onDismiss={reminders.dismiss} />
          </>
        )}

        {missingTab ? (
          shownMissing.length > 0 ? (
            <ul className="m-team-list">
              {shownMissing.map((e) => (
                <li key={e.id} className="m-team-item m-missing-item">
                  <EmployeeAvatar id={e.id} name={e.name} photo={e.photo} />
                  <div className="m-team-copy">
                    <strong className="m-team-name">{e.name}</strong>
                    <span className="text-caption text-secondary">
                      {e.role} · {e.department}
                    </span>
                    <span className="text-caption text-secondary">חודש דיווח: {formatMonth(e.month)}</span>
                    <ApprovalBadge status="missing" />
                    <span className="m-missing-actions">
                      <RemindButton row={e} busy={reminders.busyId === e.id} disabled={reminders.busyId !== null} onClick={() => reminders.sendOne(e)} />
                      <ReminderSent reminder={e.reminder} />
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="m-team-empty">
              <strong className="text-body">{t.filtersActive ? 'לא נמצאו עובדים' : 'אין דוחות חסרים'}</strong>
              <span className="text-label text-tertiary">{t.filtersActive ? 'נסו לשנות את החיפוש או את הסינון.' : EMPTY_TAB_MESSAGE.missing}</span>
            </div>
          )
        ) : shown.length > 0 ? (
          <ul className="m-team-list">
            {shown.map((r) => (
              <li key={r.id} className="m-team-item row-link" onClick={(e) => onReportClick(e, r)}>
                <EmployeeAvatar id={employeeOf(r)} name={r.name} photo={r.photo} />
                <div className="m-team-copy">
                  {/* Keyboard entry point for the card; tapping anywhere on the card does the same. */}
                  <button type="button" className="emp-open m-team-name">
                    {r.name}
                  </button>
                  <span className="text-caption text-secondary">
                    {r.role} · {r.department}
                  </span>
                  <span className="m-team-badges">
                    <RequestTypeBadge type={r.requestType} label={typeLabel(r)} />
                    <ApprovalBadge status={r.status} />
                  </span>
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
              {!t.filtersActive ? EMPTY_TAB_MESSAGE[t.tab] : 'נסו לשנות את החיפוש או את הסינון.'}
            </span>
          </div>
        )}

        {remaining > 0 && (
          <div className="m-team-more-wrap">
            <Button variant="secondary" block className="m-team-load" onClick={() => setVisible((n) => n + BATCH)}>
              הצגת עוד {Math.min(BATCH, remaining)}
            </Button>
            <span className="text-caption text-tertiary">
              מוצגים {missingTab ? shownMissing.length : shown.length} מתוך {listLength}
            </span>
          </div>
        )}
      </section>

      {acting && (
        <ActionSheet title={acting.name} actions={sheetActions(acting)} onClose={() => setActing(null)}>
          <span className="action-sheet-context">
            <span className="text-caption text-secondary">
              {acting.role} · {acting.department} · {formatMonth(acting.month)}
            </span>
            <span className="m-team-badges">
              <RequestTypeBadge type={acting.requestType} label={typeLabel(acting)} />
              <ApprovalBadge status={acting.status} />
            </span>
          </span>
        </ActionSheet>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {t.announcement}
      </p>
    </MobileShell>
  )
}
