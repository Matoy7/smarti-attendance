import type { ButtonHTMLAttributes } from 'react'

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** Accessible name — icon buttons have no visible text. */
  label: string
  /** Icon image URL */
  icon: string
  tone?: 'ghost' | 'on-dark'
}

export function IconButton({ label, icon, tone = 'ghost', className = '', type = 'button', ...rest }: Props) {
  return (
    <button type={type} className={`icon-btn icon-btn-${tone} ${className}`.trim()} aria-label={label} {...rest}>
      <img src={icon} alt="" />
    </button>
  )
}
