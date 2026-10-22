import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { ApprovalStatus } from '@/lib/teamReports'
import { CheckIcon, MoreIcon, XIcon } from '@/components/icons'

type Props = {
  name: string
  status: ApprovalStatus
  onApprove: () => void
  onReject: () => void
}

/**
 * Desktop row actions (⋯): a WAI-ARIA menu button. Offers only the decisions that change the
 * status. The menu is fixed-positioned so the table card's overflow can't clip it.
 */
export function RowActionsMenu({ name, status, onApprove, onReject }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const button = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const items = [
    status !== 'approved' && { key: 'approve', label: 'אישור הדיווח', Icon: CheckIcon, run: onApprove },
    status !== 'rejected' && { key: 'reject', label: 'דחיית הדיווח', Icon: XIcon, run: onReject },
  ].filter(Boolean) as { key: string; label: string; Icon: typeof CheckIcon; run: () => void }[]

  const close = (refocus: boolean) => {
    setOpen(false)
    setPos(null)
    if (refocus) button.current?.focus()
  }

  // Place under the button, aligned to its left edge (the column sits at the table's left in RTL),
  // flipping above when there's no room below.
  useLayoutEffect(() => {
    if (!open || !button.current || !menu.current) return
    const b = button.current.getBoundingClientRect()
    const m = menu.current.getBoundingClientRect()
    const below = b.bottom + 4 + m.height <= window.innerHeight - 8
    setPos({ top: below ? b.bottom + 4 : b.top - 4 - m.height, left: Math.max(8, Math.min(b.left, window.innerWidth - m.width - 8)) })
  }, [open])

  // Focus the first item once the menu is placed — it is visibility:hidden while being measured,
  // and hidden elements can't take focus.
  const placed = pos !== null
  useEffect(() => {
    if (open && placed) menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  }, [open, placed])

  // Outside click, scroll or resize closes the menu.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!menu.current?.contains(e.target as Node) && !button.current?.contains(e.target as Node)) close(false)
    }
    const onMove = () => close(false)
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('resize', onMove)
    window.addEventListener('scroll', onMove, true)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('resize', onMove)
      window.removeEventListener('scroll', onMove, true)
    }
  }, [open])

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const list = [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const i = list.indexOf(document.activeElement as HTMLElement)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus()
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      list[e.key === 'Home' ? 0 : list.length - 1]?.focus()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close(true)
    } else if (e.key === 'Tab') {
      close(false)
    }
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        className="row-more"
        aria-label={`פעולות עבור ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(true) : setOpen(true))}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        <MoreIcon />
      </button>
      {open && (
        <div
          ref={menu}
          id={menuId}
          role="menu"
          aria-label={`פעולות עבור ${name}`}
          className="row-menu"
          style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden' }}
          onKeyDown={onMenuKey}
        >
          {items.map(({ key, label, Icon, run }) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={`row-menu-item row-menu-${key}`}
              onClick={() => {
                close(true)
                run()
              }}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
