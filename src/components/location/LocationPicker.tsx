import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { MIN_QUERY_LENGTH, placesConfigured, searchPlaces, type PlaceSuggestion } from '@/lib/places'
import { AlertIcon, CheckCircleIcon, PinIcon, SearchIcon } from '@/components/icons'

const DEBOUNCE_MS = 250

type Status = 'idle' | 'loading' | 'ready' | 'error'

type Props = {
  /** Autocomplete session token, one per dialog opening */
  sessionToken: string
  /** The suggestion the user picked; null until a valid one is chosen (or after the text changes again) */
  selected: PlaceSuggestion | null
  onSelect: (place: PlaceSuggestion | null) => void
  autoFocus?: boolean
  disabled?: boolean
}

/**
 * Place / address search with autocomplete (WAI-ARIA combobox + listbox).
 * Shared by the desktop modal and the mobile drawer. Only a picked suggestion counts as a
 * selection: free text never becomes a location.
 */
export function LocationPicker({ sessionToken, selected, onSelect, autoFocus, disabled }: Props) {
  const ids = useId()
  const inputId = `${ids}-input`
  const listId = `${ids}-list`
  const hintId = `${ids}-hint`
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceSuggestion[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [attempt, setAttempt] = useState(0) // bumped by "retry"
  const listRef = useRef<HTMLUListElement>(null)
  const searching = query.trim().length >= MIN_QUERY_LENGTH && !selected

  // Debounced search; each new query aborts the previous request so late answers never win.
  useEffect(() => {
    if (!placesConfigured || !searching) {
      setStatus('idle')
      setResults([])
      return
    }
    const controller = new AbortController()
    setStatus('loading')
    const timer = window.setTimeout(() => {
      searchPlaces(query, { signal: controller.signal, sessionToken })
        .then((found) => {
          setResults(found)
          setActive(-1)
          setStatus('ready')
          setOpen(true)
        })
        .catch(() => {
          if (controller.signal.aborted) return // superseded by a newer query
          setResults([])
          setStatus('error')
          setOpen(true)
        })
    }, DEBOUNCE_MS)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, searching, sessionToken, attempt])

  // Keep the keyboard-highlighted option visible inside the scrolling list.
  useEffect(() => {
    if (active < 0) return
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const choose = (place: PlaceSuggestion) => {
    onSelect(place)
    setQuery(place.primary)
    setOpen(false)
    setActive(-1)
  }

  const onChange = (value: string) => {
    setQuery(value)
    setOpen(true)
    if (selected) onSelect(null) // edited text no longer matches the picked place
  }

  // While a newer query loads, the previous suggestions stay visible (they are still valid picks).
  const options = status === 'ready' || status === 'loading' ? results : []
  const listVisible = open && searching && (status === 'ready' || status === 'error' || options.length > 0)
  // The listbox itself only shows when it has options; empty/error get their own message below.
  const expanded = listVisible && options.length > 0

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!options.length) return
      e.preventDefault()
      setOpen(true)
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((i) => (i < 0 ? (step > 0 ? 0 : options.length - 1) : (i + step + options.length) % options.length))
    } else if (e.key === 'Enter') {
      if (expanded && active >= 0 && options[active]) {
        e.preventDefault() // pick, don't submit
        choose(options[active])
      } else if (!selected) {
        e.preventDefault() // nothing valid picked yet: Enter never saves free text
      }
    } else if (e.key === 'Escape' && listVisible) {
      e.preventDefault() // first Escape closes the suggestions, not the dialog
      e.stopPropagation()
      setOpen(false)
      setActive(-1)
    }
  }

  const statusText = !placesConfigured
    ? ''
    : status === 'loading'
      ? 'מחפש…'
      : status === 'error'
        ? 'החיפוש נכשל.'
        : status === 'ready' && listVisible
          ? results.length
            ? `נמצאו ${results.length} תוצאות. השתמשו בחצים לבחירה.`
            : 'לא נמצאו תוצאות.'
          : ''

  return (
    <div className="loc-picker">
      <label htmlFor={inputId} className="loc-label text-label">
        חיפוש כתובת או מקום
      </label>

      <div className={`loc-search ${status === 'loading' ? 'is-loading' : ''}`}>
        <SearchIcon className="loc-search-icon" size={20} />
        <input
          id={inputId}
          className="loc-input"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={expanded && active >= 0 ? `${ids}-opt-${active}` : undefined}
          aria-describedby={hintId}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder="לדוגמה: דיזנגוף 50, תל אביב"
          value={query}
          disabled={disabled || !placesConfigured}
          data-autofocus={autoFocus || undefined}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
        />
        {status === 'loading' && <span className="spinner loc-search-spinner" aria-hidden="true" />}
      </div>

      <p id={hintId} className="loc-hint text-caption text-tertiary">
        {!placesConfigured
          ? 'חיפוש כתובות אינו זמין כרגע. פנו למנהל המערכת.'
          : 'הקלידו לפחות שני תווים ובחרו מקום מהרשימה.'}
      </p>

      {/* Polite announcements for screen readers: searching, result count, empty, error. */}
      <p className="sr-only" role="status" aria-live="polite">
        {statusText}
      </p>

      <ul id={listId} ref={listRef} className="loc-results" role="listbox" aria-label="הצעות מיקום" hidden={!expanded}>
        {options.map((place, i) => (
          <li
            key={place.id}
            id={`${ids}-opt-${i}`}
            data-index={i}
            role="option"
            aria-selected={i === active}
            className={`loc-option ${i === active ? 'active' : ''}`}
            // Keep focus in the input while clicking an option.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(place)}
            onMouseMove={() => active !== i && setActive(i)}
          >
            <PinIcon className="loc-option-icon" size={18} />
            <span className="loc-option-copy">
              <span className="loc-option-primary">{place.primary}</span>
              {place.secondary && <span className="loc-option-secondary text-caption">{place.secondary}</span>}
            </span>
          </li>
        ))}
      </ul>

      {listVisible && status === 'ready' && results.length === 0 && (
        <p className="loc-state text-label">לא נמצאו תוצאות עבור "{query.trim()}". נסו כתובת או שם מקום אחר.</p>
      )}

      {listVisible && status === 'error' && (
        <div className="loc-state loc-state-error text-label" role="alert">
          <AlertIcon size={18} />
          <span>לא הצלחנו לטעון הצעות. בדקו את החיבור ונסו שוב.</span>
          <button type="button" className="btn btn-link loc-retry" onClick={() => setAttempt((n) => n + 1)}>
            נסו שוב
          </button>
        </div>
      )}

      {selected && (
        <div className="loc-selected">
          <CheckCircleIcon size={20} className="loc-selected-icon" />
          <span className="loc-option-copy">
            <span className="text-caption text-secondary">המיקום שנבחר</span>
            <strong className="loc-option-primary">{selected.primary}</strong>
            {selected.secondary && <span className="loc-option-secondary text-caption">{selected.secondary}</span>}
          </span>
        </div>
      )}
    </div>
  )
}
