import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; loading?: boolean }

/** Mobile clock-in action: the round primary button (styles: .punch-orb in mobile.css). */
export function PunchButton({ className = '', children, type = 'button', loading = false, disabled, ...rest }: Props) {
  return (
    <button
      type={type}
      className={`punch-orb ${loading ? 'is-loading' : ''} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="spinner spinner-lg" aria-hidden="true" />}
      {children}
    </button>
  )
}
