import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>
  variant?: 'primary' | 'secondary' | 'link'
  size?: 'md' | 'lg'
  block?: boolean
  icon?: ReactNode
  /** Action in progress: shows a spinner in place of the icon and blocks further clicks. */
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  icon,
  loading = false,
  className = '',
  children,
  type = 'button',
  disabled,
  ...rest
}: Props) {
  const classes = ['btn', `btn-${variant}`, variant !== 'link' && `btn-${size}`, block && 'btn-block', loading && 'is-loading', className]
    .filter(Boolean)
    .join(' ')
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="spinner" aria-hidden="true" /> : icon}
      <span>{children}</span>
    </button>
  )
}
