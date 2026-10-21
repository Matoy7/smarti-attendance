import { APP_NAME } from '@/lib/app'

/** Logo mark + product name. `tone` follows the surface it sits on. */
export function Brand({ tone, className = '' }: { tone: 'on-dark' | 'on-light'; className?: string }) {
  return (
    <a className={`brand brand-${tone} ${className}`.trim()} href="#" aria-label={APP_NAME}>
      <span className="brand-mark" aria-hidden="true">
        <span />
      </span>
      <span className="brand-name">{APP_NAME}</span>
    </a>
  )
}
