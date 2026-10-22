import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }

/** Mobile clock-in action: the round primary button (styles: .punch-orb in mobile.css). */
export function PunchButton({ className = '', children, type = 'button', ...rest }: Props) {
  return (
    <button type={type} className={`punch-orb ${className}`.trim()} {...rest}>
      {children}
    </button>
  )
}
