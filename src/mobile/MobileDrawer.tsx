import { useEffect, useRef } from 'react'
import { Brand } from '@/components/Brand'
import { IconButton } from '@/components/ui'
import { ChevronIcon, CloseIcon } from '@/components/icons'
import { USER } from '@/lib/profile'
import { asset } from '@/lib/assets'
import { DRAWER_NAV } from './navigation'

type Props = { open: boolean; onClose: () => void }

/** Right-side (RTL start) navigation drawer with a dimmed overlay. */
export function MobileDrawer({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    panelRef.current?.querySelector<HTMLElement>('.drawer-close')?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panelRef.current) {
        // Keep focus inside the open drawer.
        const items = panelRef.current.querySelectorAll<HTMLElement>('button, a[href]')
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [open, onClose])

  return (
    <div className={`drawer-root ${open ? 'open' : ''}`} inert={!open} aria-hidden={!open}>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label="תפריט" ref={panelRef} id="mobile-drawer">
        <header className="drawer-header">
          <Brand tone="on-light" />
          <IconButton className="drawer-close" size="touch" label="סגירת התפריט" icon={<CloseIcon />} onClick={onClose} />
        </header>

        <div className="drawer-user">
          <img className="avatar" src={asset('assets/e53c0.png')} alt="" />
          <div className="drawer-user-copy">
            <strong className="text-label">{USER.fullName}</strong>
            <span className="text-caption text-tertiary">{USER.role}</span>
          </div>
        </div>

        <nav aria-label="תפריט משני">
          <ul className="drawer-list">
            {DRAWER_NAV.map(({ id, label, Icon }) => (
              <li key={id}>
                <button type="button" className="drawer-item">
                  <span className="drawer-item-icon">
                    <Icon />
                  </span>
                  <span className="drawer-item-label">{label}</span>
                  <ChevronIcon className="drawer-item-chevron" size={16} />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
