import { APP_NAME } from '@/lib/app'

/**
 * The סמארטי-טיים logo: bright-blue disc, navy open ring and check.
 * Fixed brand colors (same in light and dark mode); the same artwork is public/favicon.svg.
 */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg className={`brand-mark ${className}`.trim()} viewBox="0 0 360 360" aria-hidden="true" focusable="false">
      <circle cx="180" cy="180" r="180" fill="#179bfc" />
      <g fill="none" stroke="#0c1829" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round">
        <path d="M271.9 230.8A100 100 0 1 1 180.3 87" />
        <path d="M172 185l26.5 26.5L265 145" />
      </g>
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
