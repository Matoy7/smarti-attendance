import { useEffect, useId, useRef, useState, type FormEvent, type MouseEvent, type ReactNode, type SyntheticEvent } from 'react'
import { Button, IconButton } from '@/components/ui'
import { AlertIcon, CloseIcon } from '@/components/icons'
import { dayKey, type ManualTimeProblem } from '@/hooks/useAttendanceDay'
import type { AttendanceAction, ManualEntryResult } from '@/hooks/useAttendanceFlow'
import { toTimeOfDay } from '@/lib/time'
import './manual-entry.css'

type Variant = 'modal' | 'drawer'

/** What the attendance screen hands over: the action on screen and the day-record operations. */
export type ManualEntryApi = {
  checkManualTime: (action: AttendanceAction, at: Date) => ManualTimeProblem | null
  manualDates: (action: AttendanceAction) => { min: string; max: string }
  manualEntry: (action: AttendanceAction, at: Date) => Promise<ManualEntryResult>
}

type Props = ManualEntryApi & {
  /** in = on the clock-in screen, out = while working */
  action: AttendanceAction
  /** modal = desktop centered dialog; drawer = mobile bottom sheet */
  variant: Variant
  className?: string
  icon?: ReactNode
  disabled?: boolean
}

/**
 * "הכנסה ידנית של שעה": the link under the punch button and the form it opens. Records the screen's
 * action (clock-in / clock-out) at the date and time the user enters.
 */
export function ManualEntry({ action, variant, className, icon, disabled, ...api }: Props) {
  const [open, setOpen] = useState(false)
  const link = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

  // Back to the link after closing without saving. After a save the screen changes state and this
  // link unmounts; the page's live region announces the result instead.
  useEffect(() => {
    if (wasOpen.current && !open) link.current?.focus()
    wasOpen.current = open
  }, [open])

  return (
    <>
      <Button ref={link} variant="link" className={className} icon={icon} disabled={disabled} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        הכנסה ידנית של שעה
      </Button>
      {open && <ManualEntryDialog action={action} variant={variant} {...api} onClose={() => setOpen(false)} />}
    </>
  )
}

const TITLE: Record<AttendanceAction, string> = { in: 'הכנסה ידנית של שעת כניסה', out: 'הכנסה ידנית של שעת יציאה' }
const formatDay = (key: string) => `${key.slice(8, 10)}.${key.slice(5, 7)}.${key.slice(0, 4)}`

function problemText(p: ManualTimeProblem, action: AttendanceAction): string {
  switch (p.code) {
    case 'date-range':
      return p.min === p.max ? `אפשר לבחור רק את התאריך ${formatDay(p.max)}` : `אפשר לבחור תאריך בין ${formatDay(p.min)} ל-${formatDay(p.max)}`
    case 'future':
      return 'לא ניתן להזין שעה עתידית'
    case 'before-clock-in':
      return `שעת היציאה חייבת להיות אחרי שעת הכניסה (${toTimeOfDay(p.bound)})`
    case 'before-last-out':
      return `שעת הכניסה חייבת להיות אחרי היציאה האחרונה (${toTimeOfDay(p.bound)})`
    case 'state':
      return action === 'in' ? 'כבר קיימת כניסה פעילה. סגרו את החלון כדי לראות את המצב העדכני.' : 'אין כניסה פעילה לדיווח יציאה. סגרו את החלון כדי לראות את המצב העדכני.'
  }
}

type Errors = { date?: string; time?: string; form?: string }

function ManualEntryDialog({ action, variant, checkManualTime, manualDates, manualEntry, onClose }: ManualEntryApi & { action: AttendanceAction; variant: Variant; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  const [range] = useState(() => manualDates(action))
  const [date, setDate] = useState(() => dayKey(new Date()))
  const [time, setTime] = useState(() => toTimeOfDay(new Date()))
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const inFlight = useRef(false)
  // Bumped on a rejected submit: once the errors have rendered, focus moves to the first invalid field.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (attempt) ref.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [attempt])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    const root = document.documentElement
    const { overflow } = root.style
    root.style.overflow = 'hidden' // the page behind must not scroll under the modal
    return () => {
      root.style.overflow = overflow
      if (dialog.open) dialog.close()
    }
  }, [])

  /** Field-level checks, then the day-record rules. Returns the entered moment when valid. */
  const validate = (d = date, t = time): { at: Date | null; errors: Errors } => {
    const next: Errors = {}
    const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d)
    const tm = /^(\d{2}):(\d{2})$/.exec(t)
    if (!d) next.date = 'יש לבחור תאריך'
    else if (!dm) next.date = 'תאריך לא תקין'
    if (!t) next.time = 'יש להזין שעה'
    else if (!tm || Number(tm[1]) > 23 || Number(tm[2]) > 59) next.time = 'שעה לא תקינה'
    if (next.date || next.time || !dm || !tm) return { at: null, errors: next }
    const at = new Date(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]), Number(tm[1]), Number(tm[2]))
    if (at.getFullYear() !== Number(dm[1]) || at.getMonth() !== Number(dm[2]) - 1 || at.getDate() !== Number(dm[3])) return { at: null, errors: { date: 'תאריך לא תקין' } }
    const problem = checkManualTime(action, at)
    if (problem) return { at: null, errors: { [problem.field]: problemText(problem, action) } }
    return { at, errors: {} }
  }

  // After the first submit attempt, errors follow the inputs as they change.
  const change = (d: string, t: string) => {
    setDate(d)
    setTime(t)
    if (submitted) setErrors(validate(d, t).errors)
  }

  const requestClose = () => {
    if (!inFlight.current) onClose()
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
    if (inFlight.current) return
    setSubmitted(true)
    const { at, errors: found } = validate()
    setErrors(found)
    if (!at) {
      setAttempt((n) => n + 1)
      return
    }
    inFlight.current = true
    setSaving(true)
    const result = await manualEntry(action, at)
    inFlight.current = false
    if (result.ok) return onClose()
    setSaving(false)
    const message =
      result.reason === 'invalid' || result.reason === 'conflict'
        ? problemText(checkManualTime(action, at) ?? { field: 'form', code: 'state' }, action)
        : 'לא הצלחנו לשמור את השעה. נסו שוב.'
    setErrors({ form: message })
  }

  const field = (key: 'date' | 'time', label: string, input: ReactNode) => (
    <div className="field">
      <label className="field-label text-label" htmlFor={`${id}-${key}`}>
        {label}
      </label>
      {input}
      {errors[key] && (
        <p id={`${id}-${key}-error`} className="field-error text-caption">
          <AlertIcon size={16} />
          <span>{errors[key]}</span>
        </p>
      )}
    </div>
  )

  return (
    <dialog ref={ref} className={`sheet sheet-${variant} me-dialog`} aria-labelledby={`${id}-title`} aria-describedby={`${id}-hint`} onCancel={onCancel} onClick={onBackdropClick}>
      <form className="sheet-panel" onSubmit={onSubmit} noValidate>
        {variant === 'drawer' && <span className="sheet-grabber" aria-hidden="true" />}

        <header className="sheet-header">
          <h2 id={`${id}-title`} className="text-heading">
            {TITLE[action]}
          </h2>
          <IconButton className="sheet-close" size={variant === 'drawer' ? 'touch' : 'md'} label="סגירה" icon={<CloseIcon />} onClick={requestClose} disabled={saving} />
        </header>

        <div className="sheet-body">
          <p id={`${id}-hint`} className="text-label text-secondary me-hint">
            {action === 'in' ? 'בחרו את התאריך והשעה שבהם התחלתם לעבוד.' : 'בחרו את התאריך והשעה שבהם סיימתם לעבוד.'}
          </p>

          <div className="me-fields">
            {field(
              'date',
              'תאריך',
              <input
                id={`${id}-date`}
                className="field-input"
                type="date"
                dir="ltr"
                required
                min={range.min}
                max={range.max}
                value={date}
                disabled={saving}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? `${id}-date-error` : undefined}
                onChange={(e) => change(e.target.value, time)}
              />,
            )}
            {field(
              'time',
              action === 'in' ? 'שעת כניסה' : 'שעת יציאה',
              <input
                id={`${id}-time`}
                className="field-input"
                type="time"
                dir="ltr"
                required
                step={60}
                value={time}
                disabled={saving}
                data-autofocus={variant === 'modal' ? '' : undefined}
                aria-invalid={Boolean(errors.time)}
                aria-describedby={errors.time ? `${id}-time-error` : undefined}
                onChange={(e) => change(date, e.target.value)}
              />,
            )}
          </div>

          {errors.form && (
            <p className="sheet-alert text-label" role="alert">
              <AlertIcon size={18} />
              <span>{errors.form}</span>
            </p>
          )}
        </div>

        <footer className="sheet-footer">
          <Button variant="secondary" className="sheet-action" onClick={requestClose} disabled={saving}>
            ביטול
          </Button>
          <Button type="submit" className="sheet-action me-submit" loading={saving}>
            {saving ? 'שומר…' : 'הכנס שעה'}
          </Button>
        </footer>
      </form>
    </dialog>
  )
}
