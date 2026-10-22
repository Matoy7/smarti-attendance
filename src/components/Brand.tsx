import { APP_NAME } from '@/lib/app'

/**
 * The סמארטי-טיים logo: a clock with speed lines, one stroke in the brand accent (--color-brand-mark,
 * orange). The same artwork is public/favicon.svg.
 */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`brand-mark ${className}`.trim()}
      viewBox="0 0 538 427"
      fill="none"
      stroke="currentColor"
      strokeWidth="33"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M94 143H144Q168 143 152.5 125A195 195 0 1 1 151.7 301.5Q168 283.5 144 283.5H61" />
      <path d="M98.5 73H198M17.5 213H140.5M104.5 353H202" />
      <path d="M327 97.5V211L396 278" />
    </svg>
  )
}

/** Logo mark + product name. `tone` follows the surface it sits on. */
export function Brand({ tone, className = '' }: { tone: 'on-dark' | 'on-light'; className?: string }) {
  return (
    <a className={`brand brand-${tone} ${className}`.trim()} href="#" aria-label={APP_NAME}>
      <LogoMark />
      <span className="brand-name">{APP_NAME}</span>
    </a>
  )
}
