import { useEffect, useId, useRef, type MouseEvent, type ReactNode, type SyntheticEvent } from 'react'

export type SheetAction = { key: string; label: string; icon: ReactNode; tone?: 'success' | 'danger'; run: () => void }

type Props = {
  title: string
  /** Context under the title (e.g. the employee and current status) */
  children?: ReactNode
  actions: SheetAction[]
  onClose: () => void
}

/**
 * Mobile action sheet: bottom drawer (shared .sheet-drawer styles) on a native modal <dialog>,
 * so focus stays inside and the page behind is inert. Escape, backdrop and ביטול close it.
 */
export function ActionSheet({ title, children, actions, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    const root = document.documentElement
    const { overflow } = root.style
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = overflow
      if (dialog.open) dialog.close()
    }
  }, [])

  const onCancel = (e: SyntheticEvent) => {
    e.preventDefault()
    onClose()
  }
  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <dialog ref={ref} className="sheet sheet-drawer action-sheet" aria-labelledby={titleId} onCancel={onCancel} onClick={onBackdrop}>
      <div className="sheet-panel">
        <span className="sheet-grabber" aria-hidden="true" />
        <header className="sheet-header action-sheet-header">
          <h2 id={titleId} className="text-heading">
            {title}
          </h2>
          {children}
        </header>
        <div className="action-sheet-list" role="group" aria-label="פעולות">
          {actions.map((a) => (
            <button key={a.key} type="button" className={`action-sheet-item ${a.tone ? `tone-${a.tone}` : ''}`} onClick={a.run}>
              {a.icon}
              <span>{a.label}</span>
            </button>
          ))}
        </div>
        <footer className="sheet-footer">
          <button type="button" className="btn btn-secondary btn-md sheet-action" onClick={onClose}>
            <span>ביטול</span>
          </button>
        </footer>
      </div>
    </dialog>
  )
}
