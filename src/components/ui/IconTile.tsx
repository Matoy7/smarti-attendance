import type { ReactNode } from 'react'

type Props = {
  icon: ReactNode
  /** sm = 32px, md = 40px */
  size?: 'sm' | 'md'
  shape?: 'square' | 'round'
  className?: string
}

/** Tinted badge holding a decorative icon in front of a row label (summary rows, location, drawer items). */
export function IconTile({ icon, size = 'sm', shape = 'square', className = '' }: Props) {
  return (
    <span className={`icon-tile icon-tile-${size} icon-tile-${shape} ${className}`.trim()} aria-hidden="true">
      {icon}
    </span>
  )
}
