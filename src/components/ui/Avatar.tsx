import { asset } from '@/lib/assets'

type Props = {
  /** Path under /public, resolved against the deployed base path */
  src?: string
  /** Ring follows the surface: on-dark = sidebar, on-light = canvas or light surfaces */
  tone: 'on-dark' | 'on-light'
  className?: string
}

/** 40px round user photo. Decorative: the user's name is always shown or announced next to it. */
export function Avatar({ src = 'assets/e53c0.png', tone, className = '' }: Props) {
  return <img className={`avatar avatar-${tone} ${className}`.trim()} src={asset(src)} alt="" />
}
