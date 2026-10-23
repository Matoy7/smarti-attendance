import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui'
import { AlertIcon, CheckCircleIcon, ChevronIcon } from '@/components/icons'
import { ApprovalBadge } from '@/components/team/ApprovalBadge'
import { ABSENCE_ICON as ICONS, ABSENCE_LABEL as LABEL } from './absenceTypes'
import {
  ABSENCE_TYPES,
  AbsenceError,
  NOTE_MAX,
  absenceDateRange,
  absenceProblems,
  dayCount,
  dayKey,
  daysLabel,
  formatDay,
  getAbsences,
  submitAbsence,
  type Absence,
  type AbsenceErrors,
  type AbsenceType,
} from '@/lib/absences'
import { absenceStatus, useDecisions } from '@/lib/approvals'
import { goBack, navigate } from '@/lib/router'
import { USER } from '@/lib/profile'
import './absence.css'

/** A report still counts against new ones unless the manager rejected it. */
const isActive = (a: Absence) => absenceStatus(a) !== 'rejected'

/** "← חזרה" to the previous screen (or דיווח נוכחות when the page was opened directly). */
export function BackButton() {
  return (
    <button type="button" className="absence-back" onClick={() => goBack('attendance')}>
      <ChevronIcon className="icon-flip" size={18} />
      חזרה
    </button>
  )
}

type Draft = { type: AbsenceType | null; from: string; to: string; note: string }
const freshDraft = (): Draft => {
  const today = dayKey(new Date())
  return { type: null, from: today, to: today, note: '' }
}

/**
 * דיווח היעדרות — the form and its confirmation, as page content (desktop card / mobile card).
 * Full days only. Submits through lib/absences (validated, saved and verified) into the manager's
 * approval workflow; after sending, shows the report with its live approval status.
 */
export function AbsenceReport({ layout }: { layout: 'desktop' | 'mobile' }) {
  const ref = useRef<HTMLFormElement>(null)
  const id = useId()
  const [range] = useState(() => absenceDateRange())
  const [draft, setDraft] = useState<Draft>(freshDraft)
  const [errors, setErrors] = useState<AbsenceErrors>({})
  const [saveError, setSaveError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sent, setSent] = useState<Absence | null>(null)
  const [attempt, setAttempt] = useState(0)
  const inFlight = useRef(false)
  const decisions = useDecisions()
  const { type, from, to, note } = draft

  // A rejected submit: once errors have rendered, focus the first invalid field.
  useEffect(() => {
    if (attempt) ref.current?.querySelector<HTMLElement>('.absence-types[aria-invalid="true"] input, input[aria-invalid="true"], textarea[aria-invalid="true"]')?.focus()
  }, [attempt])

  // After sending, the confirmation heading takes focus so the result is read out.
  useEffect(() => {
    if (sent) ref.current?.querySelector<HTMLElement>('[data-sent-title]')?.focus()
  }, [sent])

  const validate = (next: Draft = draft) => absenceProblems(next, USER.employeeId, getAbsences(), isActive)

  const update = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch }
    // Moving the start past the end (or a one-day range) carries the end along.
    if (patch.from !== undefined && (to < patch.from || from === to)) next.to = patch.from
    setDraft(next)
    setSaveError('')
    if (submitted) setErrors(validate(next))
  }

  const startOver = () => {
    setDraft(freshDraft())
    setErrors({})
    setSubmitted(false)
    setSent(null)
    requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('input[name="absence-type"]')?.focus())
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (inFlight.current || sent) return
    setSubmitted(true)
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length || !type) return setAttempt((n) => n + 1)
    inFlight.current = true
    setSaving(true)
    setSaveError('')
    try {
      setSent(await submitAbsence({ type, from, to, note }, USER.employeeId, isActive))
    } catch (error) {
      if (error instanceof AbsenceError && error.reason === 'invalid') {
        setErrors(validate()) // e.g. another tab sent an overlapping report meanwhile
        setAttempt((n) => n + 1)
      } else setSaveError('לא הצלחנו לשלוח את הדיווח. הפרטים נשמרו בטופס — נסו שוב.')
    } finally {
      inFlight.current = false
      setSaving(false)
    }
  }

  const days = !errors.from && !errors.to && from && to && to >= from ? dayCount(from, to) : 0
  const err = (key: keyof AbsenceErrors) =>
    errors[key] && (
      <p id={`${id}-${key}-error`} className="field-error text-caption">
        <AlertIcon size={16} />
        <span>{errors[key]}</span>
      </p>
    )
  const invalid = (key: keyof AbsenceErrors) => ({ 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? `${id}-${key}-error` : undefined })

  if (sent)
    return (
      <form ref={ref} className={`absence-form absence-${layout}`} onSubmit={(e) => e.preventDefault()}>
        <div className="absence-sent" role="status">
          <span className="absence-sent-icon" aria-hidden="true">
            <CheckCircleIcon size={28} />
          </span>
          <h2 className="text-heading" tabIndex={-1} data-sent-title>
            הדיווח נשלח
          </h2>
          <p className="text-label text-secondary">הדיווח הועבר לאישור המנהל/ת. הסטטוס מתעדכן כאן ובדיווחים שלי.</p>
        </div>
        <dl className="absence-summary">
          <div>
            <dt className="text-label text-secondary">סוג</dt>
            <dd>{LABEL[sent.type]}</dd>
          </div>
          <div>
            <dt className="text-label text-secondary">תאריכים</dt>
            <dd>
              <span className="absence-nowrap">{sent.from === sent.to ? formatDay(sent.from) : `${formatDay(sent.from)} – ${formatDay(sent.to)}`}</span>
              {' · '}
              <span className="absence-nowrap">{daysLabel(dayCount(sent.from, sent.to))}</span>
            </dd>
          </div>
          {sent.note && (
            <div>
              <dt className="text-label text-secondary">הערות</dt>
              <dd className="absence-summary-note">{sent.note}</dd>
            </div>
          )}
          <div>
            <dt className="text-label text-secondary">סטטוס</dt>
            <dd>
              <ApprovalBadge status={absenceStatus(sent, decisions)} />
            </dd>
          </div>
        </dl>
        <div className="absence-actions">
          <Button variant="secondary" size="lg" className="absence-action" onClick={startOver}>
            דיווח היעדרות נוסף
          </Button>
          <Button size="lg" className="absence-action absence-submit" onClick={() => navigate('my-reports')}>
            לדיווחים שלי
          </Button>
        </div>
      </form>
    )

  return (
    <form ref={ref} className={`absence-form absence-${layout}`} onSubmit={onSubmit} noValidate aria-label="דיווח היעדרות">
      <fieldset className="absence-fieldset" aria-describedby={errors.type ? `${id}-type-error` : undefined}>
        <legend className="field-label text-label">סוג היעדרות</legend>
        <div className="absence-types" role="radiogroup" aria-required="true" aria-invalid={Boolean(errors.type)}>
          {ABSENCE_TYPES.map(({ id: value, label }) => {
            const Icon = ICONS[value]
            return (
              <label key={value} className={`absence-type ${type === value ? 'selected' : ''}`}>
                <input type="radio" name="absence-type" value={value} checked={type === value} disabled={saving} onChange={() => update({ type: value })} />
                <span className="absence-type-icon">
                  <Icon size={24} />
                </span>
                <span className="absence-type-label">{label}</span>
              </label>
            )
          })}
        </div>
        {err('type')}
      </fieldset>

      <div className="absence-dates">
        <div className="field">
          <label className="field-label text-label" htmlFor={`${id}-from`}>
            מתאריך (כולל)
          </label>
          <input id={`${id}-from`} className="field-input" type="date" dir="ltr" required min={range.min} max={range.max} value={from} disabled={saving} {...invalid('from')} onChange={(e) => update({ from: e.target.value })} />
          {err('from')}
        </div>
        <div className="field">
          <label className="field-label text-label" htmlFor={`${id}-to`}>
            עד תאריך (כולל)
          </label>
          <input id={`${id}-to`} className="field-input" type="date" dir="ltr" required min={from || range.min} max={range.max} value={to} disabled={saving} {...invalid('to')} onChange={(e) => update({ to: e.target.value })} />
          {err('to')}
        </div>
      </div>
      <p className="absence-days text-caption text-secondary" aria-live="polite">
        היעדרות בימים מלאים{days ? ` · סה״כ ${daysLabel(days)}` : ''}
      </p>

      <div className="field">
        <label className="field-label text-label" htmlFor={`${id}-note`}>
          הערות (אופציונלי)
        </label>
        <textarea
          id={`${id}-note`}
          className="field-input absence-note"
          rows={3}
          maxLength={NOTE_MAX}
          placeholder="לדוגמה: חולה עם חום"
          value={note}
          disabled={saving}
          {...invalid('note')}
          onChange={(e) => update({ note: e.target.value })}
        />
        {err('note')}
      </div>

      {saveError && (
        <p className="sheet-alert text-label" role="alert">
          <AlertIcon size={18} />
          <span>{saveError}</span>
        </p>
      )}

      <div className="absence-actions">
        {layout === 'desktop' && (
          <Button variant="secondary" size="lg" className="absence-action" onClick={() => goBack('attendance')} disabled={saving}>
            ביטול
          </Button>
        )}
        <Button type="submit" size="lg" className="absence-action absence-submit" loading={saving}>
          {saving ? 'שולח…' : 'שלח דיווח'}
        </Button>
      </div>
    </form>
  )
}
