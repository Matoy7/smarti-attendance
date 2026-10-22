import type { ReactNode } from 'react'
import { ChevronDownIcon } from '@/components/icons'

type Props = {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  icon?: ReactNode
  className?: string
}

/** Native <select> (keyboard + mobile pickers for free) styled like the app's fields. */
export function SelectField({ label, value, options, onChange, icon, className = '' }: Props) {
  return (
    // aria-label names the select itself; wrapping it in a <label> would add the selected value to its name.
    <span className={`select-field ${icon ? 'has-icon' : ''} ${className}`.trim()}>
      {icon && <span className="select-field-icon">{icon}</span>}
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="select-field-chevron" size={18} />
    </span>
  )
}
