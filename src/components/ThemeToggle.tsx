import { IconButton } from '@/components/ui'
import { MoonIcon, SunIcon } from '@/components/icons'
import { useTheme } from '@/hooks/useTheme'

type Props = { tone: 'on-dark' | 'ghost'; size?: 'md' | 'touch'; className?: string }

/** Switches between light and dark mode. The icon and label name the mode it switches to. */
export function ThemeToggle({ tone, size = 'md', className = '' }: Props) {
  const { theme, toggle } = useTheme()
  const toDark = theme === 'light'
  const label = toDark ? 'מעבר למצב כהה' : 'מעבר למצב בהיר'
  return (
    <IconButton
      className={`theme-toggle ${className}`.trim()}
      tone={tone}
      size={size}
      label={label}
      title={label}
      icon={toDark ? <MoonIcon /> : <SunIcon />}
      onClick={toggle}
    />
  )
}
