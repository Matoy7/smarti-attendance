import { useEffect, useId, useRef, useState, type ComponentType, type FormEvent, type MouseEvent, type SyntheticEvent } from 'react'
import { Button, IconButton } from '@/components/ui'
import { AlertIcon, CheckCircleIcon, CloseIcon, HelmetIcon, MoreIcon, StethoscopeIcon, UmbrellaIcon } from '@/components/icons'
import { ApprovalBadge } from '@/components/team/ApprovalBadge'
import {
  ABSENCE_TYPES,
  AbsenceError,
  NOTE_MAX,
  absenceDateRange,
  absenceProblems,
  closeAbsenceForm,
  dayCount,
  dayKey,
  daysLabel,
  formatDay,
  getAbsences,
  submitAbsence,
  useAbsenceFormOpen,
  type Absence,
  type AbsenceErrors,
  type AbsenceType,
} from '@/lib/absences'
import { absenceStatus, useDecisions } from '@/lib/approvals'
import { USER } from '@/lib/profile'
import './absence.css'

const ICONS: Record<AbsenceType, ComponentType<{ size?: number }>> = { sick: StethoscopeIcon, vacation: UmbrellaIcon, reserve: HelmetIcon, other: MoreIcon }
const LABEL = Object.fromEntries(ABSENCE_TYPES.map((t) => [t.id, t.label])) as Record<AbsenceType, string>
/** A report still counts against new ones unless the manager rejected it. */
const isActive = (a: Absence) => absenceStatus(a) !== 'rejected'

/** דיווח היעדרות, opened from the nav item (lib/absences: openAbsenceForm). Desktop: centered modal; mobile: bottom sheet. */
export function AbsenceForm({ variant }: { variant: 'modal' | 'drawer' }) {
  const open = useAbsenceFormOpen()
  return open ? <AbsenceDialog variant={variant} /> : null
}

function AbsenceDialog({ variant }: { variant: 'modal' | 'drawer' }) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  const [range] = useState(() => absenceDateRange())
  const today = dayKey(new Date())
  const [type, setType] = useState<AbsenceType | null>(null)
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<AbsenceErrors>({})
  const [saveError, setSaveError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sent, setSent] = useState<Absence | null>(null)
  const [attempt, setAttempt] = useState(0)
  const inFlight = useRef(false)
  const decisions = useDecisions()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    // Start on the first type card (keyboard / screen readers land on the first required choice).
    if (variant === 'modal') dialog.querySelector<HTMLElement>('input[name="absence-type"]')?.focus()
    const root = document.documentElement
    const { overflow } = root.style
    root.style.overflow = 'hidden' // the page behind must not scroll under the modal
    return () => {
      root.style.overflow = overflow
      if (dialog.open) dialog.close()
    }
  }, [variant])

  // A rejected submit: once errors have rendered, focus the first invalid field.
  useEffect(() => {
    if (attempt) ref.current?.querySelector<HTMLElement>('.absence-types[aria-invalid="true"] input, input[aria-invalid="true"], textarea[aria-invalid="true"]')?.focus()
  }, [attempt])

  // After sending, the confirmation heading takes focus so the result is read out.
  useEffect(() => {
    if (sent) ref.current?.querySelector<HTMLElement>('[data-sent-title]')?.focus()
  }, [sent])

  const validate = (next = { type, from, to, note }) => absenceProblems(next, USER.employeeId, getAbsences(), isActive)

  const update = (patch: Partial<{ type: AbsenceType | null; from: string; to: string; note: string }>) => {
    const next = { type, from, to, note, ...patch }
    // Moving the start past the end (or a one-day range) carries the end along.
    if (patch.from !== undefined && (to < patch.from || from === to)) next.to = patch.from
    setType(next.type)
    setFrom(next.from)
    setTo(next.to)
    setNote(next.note)
    setSaveError('')
    if (submitted) setErrors(validate(next))
  }

  const requestClose = () => {
    if (!inFlight.current) closeAbsenceForm()
  }
  const onCancel = (e: SyntheticEvent) => {
    e.preventDefault()
    requestClose()
  }
  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) requestClose()
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (sent) return requestClose()
    if (inFlight.current) return
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

  return (
    <dialog ref={ref} className={`sheet sheet-${variant} absence-dialog`} aria-labelledby={`${id}-title`} onCancel={onCancel} onClick={onBackdropClick}>
      <form className="sheet-panel" onSubmit={onSubmit} noValidate>
        {variant === 'drawer' && <span className="sheet-grabber" aria-hidden="true" />}

        <header className="sheet-header">
          <h2 id={`${id}-title`} className="text-heading">
            דיווח היעדרות
          </h2>
          <IconButton className="sheet-close" size={variant === 'drawer' ? 'touch' : 'md'} label="סגירה" icon={<CloseIcon />} onClick={requestClose} disabled={saving} />
        </header>

        {sent ? (
          <div className="sheet-body absence-sent">
            <span className="absence-sent-icon" aria-hidden="true">
              <CheckCircleIcon size={28} />
            </span>
            <h3 className="text-heading" tabIndex={-1} data-sent-title>
              הדיווח נשלח
            </h3>
            <p className="text-label text-secondary">הדיווח הועבר לאישור המנהל/ת. הסטטוס יתעדכן כאן ובדיווחי העובדים.</p>
            <dl className="absence-summary">
              <div>
                <dt className="text-label text-secondary">סוג</dt>
                <dd>{LABEL[sent.type]}</dd>
              </div>
              <div>
                <dt className="text-label text-secondary">תאריכים</dt>
                <dd>
                  {sent.from === sent.to ? formatDay(sent.from) : `${formatDay(sent.from)}–${formatDay(sent.to)}`} · {daysLabel(dayCount(sent.from, sent.to))}
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
          </div>
        ) : (
          <div className="sheet-body absence-body">
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
          </div>
        )}

        <footer className="sheet-footer absence-footer">
          {sent ? (
            <Button type="submit" className="sheet-action absence-submit">
              סגירה
            </Button>
          ) : (
            <>
              {variant === 'modal' && (
                <Button variant="secondary" className="sheet-action" onClick={requestClose} disabled={saving}>
                  ביטול
                </Button>
              )}
              <Button type="submit" className="sheet-action absence-submit" loading={saving}>
                {saving ? 'שולח…' : 'שלח דיווח'}
              </Button>
            </>
          )}
        </footer>
      </form>
    </dialog>
  )
}
