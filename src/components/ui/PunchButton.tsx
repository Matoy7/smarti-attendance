import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; icon?: ReactNode; loading?: boolean }

/**
 * Mobile attendance action (דווח כניסה / דווח יציאה): the round royal-blue "orb" with an icon
 * above the label (styles: .punch-orb in mobile.css). While loading, a spinner replaces the icon.
 */
export function PunchButton({ className = '', children, icon, type = 'button', loading = false, disabled, ...rest }: Props) {
  return (
    <button
      type={type}
      className={`punch-orb ${loading ? 'is-loading' : ''} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span className="punch-orb-label">
        {loading ? <span className="spinner spinner-orb" aria-hidden="true" /> : icon && <span className="punch-orb-icon">{icon}</span>}
        {children}
      </span>
    </button>
  )
}
