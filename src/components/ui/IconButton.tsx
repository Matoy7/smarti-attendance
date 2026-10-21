import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** Accessible name — icon buttons have no visible text. */
  label: string
  /** Image URL or an inline icon element */
  icon: string | ReactNode
  tone?: 'ghost' | 'on-dark' | 'surface'
  /** `touch` = 48px target for mobile */
  size?: 'md' | 'touch'
}

export function IconButton({ label, icon, tone = 'ghost', size = 'md', className = '', type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={`icon-btn icon-btn-${tone} icon-btn-${size} ${className}`.trim()}
      aria-label={label}
      {...rest}
    >
      {typeof icon === 'string' ? <img src={icon} alt="" /> : icon}
    </button>
  )
}
