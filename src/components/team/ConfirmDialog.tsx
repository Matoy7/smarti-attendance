import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode, type SyntheticEvent } from 'react'
import { Button, IconButton } from '@/components/ui'
import { AlertIcon, CloseIcon } from '@/components/icons'

type Props = {
  /** modal = desktop centered dialog; drawer = mobile bottom sheet (the shared sheet shell) */
  variant: 'modal' | 'drawer'
  title: string
  children: ReactNode
  confirmLabel: string
  busyLabel: string
  /** Resolves true when done (the dialog closes), false to show `errorText` and stay open */
  onConfirm: () => Promise<boolean>
  errorText: string
  onClose: () => void
}

/** Confirmation before an action that affects many people (e.g. reminding every employee). */
export function ConfirmDialog({ variant, title, children, confirmLabel, busyLabel, onConfirm, errorText, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const inFlight = useRef(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    const root = document.documentElement
    const { overflow } = root.style
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = overflow
      if (dialog.open) dialog.close()
    }
  }, [])

  const requestClose = () => {
    if (!inFlight.current) onClose()
  }
  const onCancel = (e: SyntheticEvent) => {
    e.preventDefault()
    requestClose()
  }
  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) requestClose()
  }
  const confirm = async () => {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setFailed(false)
    const ok = await onConfirm()
    inFlight.current = false
    setBusy(false)
    if (ok) onClose()
    else setFailed(true)
  }

  return (
    <dialog ref={ref} className={`sheet sheet-${variant} confirm-dialog`} aria-labelledby={`${id}-title`} aria-describedby={`${id}-body`} onCancel={onCancel} onClick={onBackdrop}>
      <div className="sheet-panel">
        {variant === 'drawer' && <span className="sheet-grabber" aria-hidden="true" />}
        <header className="sheet-header">
          <h2 id={`${id}-title`} className="text-heading">
            {title}
          </h2>
          <IconButton className="sheet-close" size={variant === 'drawer' ? 'touch' : 'md'} label="סגירה" icon={<CloseIcon />} onClick={requestClose} disabled={busy} />
        </header>
        <div className="sheet-body">
          <div id={`${id}-body`} className="confirm-body text-body">
            {children}
          </div>
          {failed && (
            <p className="sheet-alert text-label" role="alert">
              <AlertIcon size={18} />
              <span>{errorText}</span>
            </p>
          )}
        </div>
        <footer className="sheet-footer">
          <Button variant="secondary" className="sheet-action" onClick={requestClose} disabled={busy}>
            ביטול
          </Button>
          <Button className="sheet-action confirm-action" onClick={confirm} loading={busy} data-autofocus="">
            {busy ? busyLabel : confirmLabel}
          </Button>
        </footer>
      </div>
    </dialog>
  )
}
