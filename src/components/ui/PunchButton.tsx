import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; loading?: boolean }

/**
 * Mobile attendance action (דווח כניסה / דווח יציאה): the round "orb" button — a blue disc with a
 * raised inner disc and a thin ring (styles: .punch-orb in mobile.css). The label sits above the
 * decorative layers.
 */
export function PunchButton({ className = '', children, type = 'button', loading = false, disabled, ...rest }: Props) {
  return (
    <button
      type={type}
      className={`punch-orb ${loading ? 'is-loading' : ''} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span className="punch-orb-label">
        {loading && <span className="spinner spinner-lg" aria-hidden="true" />}
        {children}
      </span>
    </button>
  )
}
