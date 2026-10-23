import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { ChevronDownIcon } from '@/components/icons'

type Props<T extends string> = {
  /** Field name, e.g. "סוג בקשה"; shown when nothing is selected (= all) */
  label: string
  /** Word for "everything", e.g. "כל הסוגים" */
  allLabel: string
  options: { value: T; label: string }[]
  selected: ReadonlySet<T>
  onChange: (next: ReadonlySet<T>) => void
  className?: string
}

/**
 * Multi-select filter in the look of SelectField: a button that opens a checkbox list.
 * Nothing checked means no restriction. Escape / outside click close it; focus returns to the button.
 * The list is fixed-positioned under the button, so a scrolling filter row can't clip it; scrolling
 * closes it.
 */
export function MultiSelectField<T extends string>({ label, allLabel, options, selected, onChange, className = '' }: Props<T>) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLSpanElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const [pos, setPos] = useState<CSSProperties | null>(null)

  // Under the button, aligned to its start edge (right in RTL), kept inside the viewport.
  useLayoutEffect(() => {
    if (!open || !root.current) return setPos(null)
    const b = root.current.getBoundingClientRect()
    const right = Math.max(8, window.innerWidth - b.right)
    // The app is RTL: the inline start edge is the right edge.
    setPos({ position: 'fixed', top: b.bottom + 4, insetInlineStart: right, maxWidth: window.innerWidth - right - 8, minWidth: Math.min(b.width, window.innerWidth - right - 8) })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        button.current?.focus()
      }
    }
    const onScroll = (e: Event) => {
      if (!(e.target instanceof Node && root.current?.querySelector('.multi-select-panel')?.contains(e.target))) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open])

  // Focus the first option once the list is placed (it's hidden until then).
  const placed = pos !== null
  useEffect(() => {
    if (open && placed) root.current?.querySelector<HTMLInputElement>('.multi-select-panel input')?.focus()
  }, [open, placed])

  const toggle = (value: T) => {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    onChange(next)
  }

  const chosen = options.filter((o) => selected.has(o.value))
  const summary = chosen.length === 0 ? allLabel : chosen.length === 1 ? chosen[0].label : `${label} (${chosen.length})`

  return (
    <span ref={root} className={`select-field multi-select ${open ? 'open' : ''} ${className}`.trim()}>
      <button
        ref={button}
        type="button"
        className="multi-select-button"
        aria-label={`${label}: ${chosen.length ? chosen.map((c) => c.label).join(', ') : allLabel}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <span className={chosen.length ? 'multi-select-value' : undefined}>{summary}</span>
      </button>
      <ChevronDownIcon className="select-field-chevron" size={18} />
      {open && (
        <div id={panelId} className="multi-select-panel" role="group" aria-label={label} style={pos ?? { visibility: 'hidden' }}>
          {options.map((o) => (
            <label key={o.value} className="multi-select-option">
              <input type="checkbox" className="check" checked={selected.has(o.value)} onChange={() => toggle(o.value)} />
              <span>{o.label}</span>
            </label>
          ))}
          <button type="button" className="multi-select-clear" onClick={() => onChange(new Set())} disabled={!chosen.length}>
            ניקוי הבחירה
          </button>
        </div>
      )}
    </span>
  )
}
