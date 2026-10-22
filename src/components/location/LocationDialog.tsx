import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type MouseEvent, type SyntheticEvent } from 'react'
import { newSessionToken, type PlaceSuggestion } from '@/lib/places'
import { saveLocation, type WorkLocation } from '@/lib/location'
import { Button, IconButton, IconTile } from '@/components/ui'
import { AlertIcon, CloseIcon, PinIcon } from '@/components/icons'
import { useKeyboardInset } from '@/hooks/useKeyboardInset'
import { LocationPicker } from './LocationPicker'
import './location.css'

type Props = {
  /** modal = desktop centered dialog; drawer = mobile bottom sheet. Same content and logic. */
  variant: 'modal' | 'drawer'
  current: WorkLocation
  onClose: () => void
  /** Called after the new location is saved and confirmed */
  onSaved: (location: WorkLocation) => void
}

/**
 * "Change work location". Mounted while open; a native modal <dialog> provides the top layer,
 * focus containment and an inert background. Nothing changes until Save is confirmed:
 * Cancel, ✕, Escape and the backdrop all close without touching the saved location.
 */
export function LocationDialog({ variant, current, onClose, onSaved }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [sessionToken] = useState(newSessionToken)
  const [selected, setSelected] = useState<PlaceSuggestion | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const inFlight = useRef(false) // synchronous double-submit guard
  const keyboardInset = useKeyboardInset(variant === 'drawer')

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    // React's autoFocus runs before showModal() (and is then overridden), so focus the
    // requested field once the dialog is actually modal.
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    // The page behind must not scroll (iOS scrolls it under a modal otherwise).
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

  // Escape: closes unless a save is in flight. The picker swallows the first Escape while suggestions are open.
  const onCancel = (e: SyntheticEvent) => {
    e.preventDefault()
    requestClose()
  }

  // A click whose target is the <dialog> itself landed on the backdrop.
  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) requestClose()
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selected || inFlight.current) return
    inFlight.current = true
    setSaving(true)
    setSaveFailed(false)
    const next: WorkLocation = { name: selected.primary, address: selected.secondary, placeId: selected.id }
    try {
      await saveLocation(next)
      inFlight.current = false
      onSaved(next)
    } catch {
      inFlight.current = false
      setSaving(false)
      setSaveFailed(true)
    }
  }

  const style = variant === 'drawer' ? ({ '--keyboard-inset': `${keyboardInset}px` } as CSSProperties) : undefined

  return (
    <dialog
      ref={ref}
      className={`sheet sheet-${variant}`}
      aria-labelledby={titleId}
      onCancel={onCancel}
      onClick={onBackdropClick}
      style={style}
    >
      <form className="sheet-panel" onSubmit={onSubmit} noValidate>
        {variant === 'drawer' && <span className="sheet-grabber" aria-hidden="true" />}

        <header className="sheet-header">
          <h2 id={titleId} className="text-heading">
            שינוי מיקום עבודה
          </h2>
          <IconButton
            className="sheet-close"
            size={variant === 'drawer' ? 'touch' : 'md'}
            label="סגירה"
            icon={<CloseIcon />}
            onClick={requestClose}
            disabled={saving}
          />
        </header>

        <div className="sheet-body">
          <section className="loc-current" aria-label="המיקום הנוכחי">
            <IconTile icon={<PinIcon size={16} />} shape="round" className="loc-current-pin" />
            <span className="loc-option-copy">
              <span className="text-caption text-secondary">המיקום הנוכחי</span>
              <strong className="loc-option-primary">{current.name}</strong>
              <span className="loc-option-secondary text-caption">{current.address}</span>
            </span>
          </section>

          <LocationPicker
            sessionToken={sessionToken}
            selected={selected}
            onSelect={(place) => {
              setSelected(place)
              setSaveFailed(false)
            }}
            autoFocus={variant === 'modal'}
            disabled={saving}
          />

          {saveFailed && (
            <p className="loc-state loc-state-error text-label" role="alert">
              <AlertIcon size={18} />
              <span>לא הצלחנו לשמור את המיקום. המיקום הקודם נשמר. נסו שוב.</span>
            </p>
          )}
        </div>

        <footer className="sheet-footer">
          <Button variant="secondary" className="sheet-action" onClick={requestClose} disabled={saving}>
            ביטול
          </Button>
          <Button
            type="submit"
            className="sheet-action"
            disabled={!selected}
            loading={saving}
            aria-describedby={!selected ? `${titleId}-need` : undefined}
          >
            {saving ? 'שומר…' : 'שמירה'}
          </Button>
          {!selected && (
            <span id={`${titleId}-need`} className="sr-only">
              יש לבחור מקום מרשימת ההצעות לפני השמירה
            </span>
          )}
        </footer>
      </form>
    </dialog>
  )
}
