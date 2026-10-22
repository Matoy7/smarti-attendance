import { useEffect, useState } from 'react'
import { AlertIcon, CheckCircleIcon, CloseIcon } from '@/components/icons'
import { feedbackMessage, type AttendanceFeedback as Feedback } from '@/hooks/useAttendanceFlow'
import './attendance-feedback.css'

/** How long a success message stays before it collapses away. Errors stay until dismissed or retried. */
const SUCCESS_VISIBLE_MS = 5000
/** Matches --duration-slow; the collapse finishes before the feedback is cleared. */
const COLLAPSE_MS = 320

type Props = { feedback: Feedback | null; onDismiss: () => void }

/**
 * Result of the last clock-in / clock-out, at the top of the attendance card.
 * Success: light-green banner with a check, then a short, smooth collapse.
 * Error: restrained coral banner that stays (the action button below is the retry).
 * Screen readers get the same text from the page's polite live region.
 */
export function AttendanceFeedback({ feedback, onDismiss }: Props) {
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    setClosing(false)
    if (feedback?.kind !== 'success') return
    const hide = window.setTimeout(() => setClosing(true), SUCCESS_VISIBLE_MS)
    const clear = window.setTimeout(onDismiss, SUCCESS_VISIBLE_MS + COLLAPSE_MS)
    return () => {
      window.clearTimeout(hide)
      window.clearTimeout(clear)
    }
  }, [feedback, onDismiss])

  if (!feedback) return null
  const success = feedback.kind === 'success'

  return (
    <div className={`feedback-slot ${closing ? 'closing' : ''}`}>
      <div className="feedback-clip">
        <div className={`feedback feedback-${success ? 'success' : 'error'}`}>
          {success ? <CheckCircleIcon size={20} className="feedback-icon" /> : <AlertIcon size={20} className="feedback-icon" />}
          <p className="feedback-text text-label">{feedbackMessage(feedback)}</p>
          {!success && (
            <button type="button" className="feedback-close" aria-label="סגירת ההודעה" onClick={onDismiss}>
              <CloseIcon size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
