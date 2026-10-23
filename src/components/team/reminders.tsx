import { useState } from 'react'
import { AlertIcon, BellIcon, CheckCircleIcon, CloseIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import type { MissingRow } from '@/hooks/useTeamReports'
import type { Reminder } from '@/lib/reminders'
import { formatMonth } from '@/lib/teamReports'
import { ConfirmDialog } from './ConfirmDialog'
import '@/components/attendance/attendance-feedback.css'

type Banner = { kind: 'success' | 'error'; text: string } | null

/**
 * Reminder actions for the טרם הוגש view (desktop and mobile): one employee right away, or everyone
 * shown after a confirmation. Results are reported only after the reminder is saved.
 */
export function useReminderActions(remind: (ids: string[]) => Promise<boolean>, rows: MissingRow[], month: string) {
  const [confirming, setConfirming] = useState(false)
  const [banner, setBanner] = useState<Banner>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const done = (ok: boolean, count: number, name?: string) =>
    setBanner(
      ok
        ? { kind: 'success', text: `${count === 1 && name ? `נשלחה תזכורת ל${name}` : `נשלחה תזכורת ל-${count} עובדים`} להגשת דוח הנוכחות של ${formatMonth(month)}. היא מופיעה להם כהתראה באפליקציה.` }
        : { kind: 'error', text: 'לא הצלחנו לשלוח את התזכורת. לא נשלח דבר — נסו שוב.' },
    )

  const sendOne = async (row: MissingRow) => {
    if (busyId) return
    setBusyId(row.id)
    const ok = await remind([row.id])
    setBusyId(null)
    done(ok, 1, row.name)
  }

  const sendAll = async () => {
    const ok = await remind(rows.map((r) => r.id))
    if (ok) done(true, rows.length)
    return ok
  }

  return { confirming, setConfirming, banner, dismiss: () => setBanner(null), busyId, sendOne, sendAll }
}

export function ReminderBanner({ banner, onDismiss }: { banner: Banner; onDismiss: () => void }) {
  if (!banner) return null
  const ok = banner.kind === 'success'
  return (
    <div className={`feedback feedback-${ok ? 'success' : 'error'} reminder-banner`} role={ok ? 'status' : 'alert'}>
      {ok ? <CheckCircleIcon size={20} className="feedback-icon" /> : <AlertIcon size={20} className="feedback-icon" />}
      <p className="feedback-text text-label">{banner.text}</p>
      <button type="button" className="feedback-close" aria-label="סגירת ההודעה" onClick={onDismiss}>
        <CloseIcon size={16} />
      </button>
    </div>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')
/** "תזכורת נשלחה 23.10 · 22:15" */
export function ReminderSent({ reminder }: { reminder?: Reminder }) {
  if (!reminder) return null
  const d = new Date(reminder.sentAt)
  return (
    <span className="reminder-sent text-caption">
      תזכורת נשלחה {pad(d.getDate())}.{pad(d.getMonth() + 1)} · {pad(d.getHours())}:{pad(d.getMinutes())}
    </span>
  )
}

/** "שליחת תזכורת" for one employee. */
export function RemindButton({ row, busy, disabled, onClick, block }: { row: MissingRow; busy: boolean; disabled: boolean; onClick: () => void; block?: boolean }) {
  return (
    <Button variant="secondary" className={`remind-one ${block ? 'remind-one-block' : ''}`.trim()} icon={<BellIcon size={16} />} loading={busy} disabled={disabled} onClick={onClick} aria-label={`שליחת תזכורת ל${row.name}`}>
      {row.reminder ? 'תזכורת נוספת' : 'שליחת תזכורת'}
    </Button>
  )
}

/** The prominent "remind everyone shown" action and its confirmation. */
export function RemindAll({ actions, rows, month, variant }: { actions: ReturnType<typeof useReminderActions>; rows: MissingRow[]; month: string; variant: 'modal' | 'drawer' }) {
  return (
    <>
      <Button className="remind-all" icon={<BellIcon size={18} />} disabled={!rows.length} onClick={() => actions.setConfirming(true)} aria-haspopup="dialog">
        שליחת תזכורת לכולם ({rows.length})
      </Button>
      {actions.confirming && (
        <ConfirmDialog
          variant={variant}
          title="שליחת תזכורת"
          confirmLabel={`שליחה ל-${rows.length} עובדים`}
          busyLabel="שולח…"
          errorText="לא הצלחנו לשלוח את התזכורת. לא נשלח דבר — נסו שוב."
          onConfirm={actions.sendAll}
          onClose={() => actions.setConfirming(false)}
        >
          <p>
            לשלוח תזכורת להגשת דוח הנוכחות של <strong>{formatMonth(month)}</strong> ל-<strong>{rows.length} עובדים</strong> שטרם הגישו?
          </p>
          <p className="text-label text-secondary">התזכורת תופיע לכל עובד כהתראה באפליקציה עד שיגיש את הדוח.</p>
        </ConfirmDialog>
      )}
    </>
  )
}
