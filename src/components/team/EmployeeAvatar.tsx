import { asset } from '@/lib/assets'
import { initials } from '@/lib/teamReports'

/** Employee photo, or initials on a tinted disc (stable tint per employee). Decorative: the name is always next to it. */
export function EmployeeAvatar({ id, name, photo, size = 'md' }: { id: string; name: string; photo?: string; size?: 'md' | 'lg' }) {
  if (photo) return <img className={`emp-avatar emp-avatar-${size}`} src={asset(photo)} alt="" />
  const tint = [...id].reduce((n, c) => n + c.charCodeAt(0), 0) % 3
  return (
    <span className={`emp-avatar emp-avatar-${size} emp-avatar-tint-${tint}`} aria-hidden="true">
      {initials(name)}
    </span>
  )
}
