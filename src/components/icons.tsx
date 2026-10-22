import type { SVGProps } from 'react'

/**
 * Outline icon set in the desktop sidebar's style (20×20 grid, ~1.6px rounded
 * strokes, currentColor). The first four are the desktop sidebar icons
 * (originally SVG files from the Figma export) inlined so active/inactive states can recolor them.
 * Direction-sensitive icons (enter/exit arrows) carry .icon-rtl-mirror.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const ClockIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="8.33" />
    <path d="M10 5V10L13.33 11.67" />
  </Icon>
)

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="3.33" width="15" height="15" rx="1.67" />
    <path d="M13.33 1.67V5M6.67 1.67V5M2.5 8.33H17.5" />
  </Icon>
)

export const DocumentIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M11.67 1.67H5C4.08 1.67 3.33 2.41 3.33 3.33V16.67C3.33 17.59 4.08 18.33 5 18.33H15C15.92 18.33 16.67 17.59 16.67 16.67V6.67L11.67 1.67Z" />
    <path d="M11.67 1.67V6.67H16.67M13.33 10.83H6.67M13.33 14.17H6.67M8.33 7.5H6.67" />
  </Icon>
)

export const UsersIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.17 17.5V15.83C14.17 13.99 12.67 12.5 10.83 12.5H4.17C2.33 12.5 0.83 13.99 0.83 15.83V17.5" />
    <circle cx="7.5" cy="5.83" r="3.33" />
    <path d="M19.17 17.5V15.83C19.17 14.31 18.14 12.99 16.67 12.61M13.33 2.61C14.81 2.99 15.84 4.31 15.84 5.84C15.84 7.36 14.81 8.69 13.33 9.07" />
  </Icon>
)

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.33 5.83H16.67M3.33 10H16.67M3.33 14.17H16.67" />
  </Icon>
)

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 5L5 15M5 5L15 15" />
  </Icon>
)

export const UserIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="6.25" r="3.75" />
    <path d="M3.33 17.5C3.33 14.28 6.32 11.67 10 11.67C13.68 11.67 16.67 14.28 16.67 17.5" />
  </Icon>
)

export const BriefcaseIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="1.67" y="5.83" width="16.67" height="11.67" rx="1.67" />
    <path d="M6.67 5.83V4.17C6.67 3.25 7.41 2.5 8.33 2.5H11.67C12.59 2.5 13.33 3.25 13.33 4.17V5.83M1.67 10.83H18.33" />
  </Icon>
)

export const ShieldCheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 18.33C10 18.33 16.67 15 16.67 10V4.17L10 1.67L3.33 4.17V10C3.33 15 10 18.33 10 18.33Z" />
    <path d="M7.08 9.79L9.17 11.88L12.92 8.13" />
  </Icon>
)

export const FolderIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18.33 15.83C18.33 16.75 17.59 17.5 16.67 17.5H3.33C2.41 17.5 1.67 16.75 1.67 15.83V4.17C1.67 3.25 2.41 2.5 3.33 2.5H7.5L9.17 5H16.67C17.59 5 18.33 5.75 18.33 6.67V15.83Z" />
  </Icon>
)

export const HelpIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="8.33" />
    <path d="M7.58 7.5C7.97 6.38 9.11 5.71 10.28 5.91C11.45 6.11 12.3 7.13 12.29 8.33C12.29 10 9.79 10.83 9.79 10.83" />
    <path d="M10 14.17H10.01" />
  </Icon>
)

export const ChevronIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12.5 15L7.5 10L12.5 5" />
  </Icon>
)

export const SettingsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="2.5" />
    <path d="M16.17 12.5C15.94 13.01 16.05 13.61 16.44 14.02L16.49 14.07C16.8 14.38 16.98 14.8 16.98 15.25C16.98 15.69 16.8 16.11 16.49 16.43C16.18 16.74 15.75 16.91 15.31 16.91C14.87 16.91 14.45 16.74 14.13 16.43L14.08 16.38C13.68 15.98 13.08 15.87 12.57 16.1C12.06 16.32 11.74 16.81 11.73 17.36V17.5C11.73 18.42 10.99 19.17 10.07 19.17C9.15 19.17 8.4 18.42 8.4 17.5V17.43C8.39 16.86 8.03 16.36 7.5 16.17C6.99 15.94 6.39 16.05 5.98 16.44L5.93 16.49C5.62 16.8 5.2 16.98 4.75 16.98C4.31 16.98 3.89 16.8 3.58 16.49C3.26 16.18 3.09 15.75 3.09 15.31C3.09 14.87 3.26 14.45 3.58 14.13L3.63 14.08C4.02 13.68 4.13 13.08 3.9 12.57C3.68 12.06 3.19 11.74 2.64 11.73H2.5C1.58 11.73 0.83 10.99 0.83 10.07C0.83 9.15 1.58 8.4 2.5 8.4H2.58C3.14 8.39 3.64 8.03 3.83 7.5C4.06 6.99 3.95 6.39 3.56 5.98L3.51 5.93C3.2 5.62 3.02 5.2 3.02 4.75C3.02 4.31 3.2 3.89 3.51 3.58C3.82 3.26 4.25 3.09 4.69 3.09C5.13 3.09 5.55 3.26 5.87 3.58L5.92 3.63C6.32 4.02 6.92 4.13 7.43 3.9H7.5C8 3.68 8.33 3.19 8.33 2.64V2.5C8.33 1.58 9.08 0.83 10 0.83C10.92 0.83 11.67 1.58 11.67 2.5V2.58C11.67 3.12 12 3.62 12.5 3.83C13.01 4.06 13.61 3.95 14.02 3.56L14.07 3.51C14.38 3.2 14.8 3.02 15.25 3.02C15.69 3.02 16.11 3.2 16.43 3.51C16.74 3.82 16.91 4.25 16.91 4.69C16.91 5.13 16.74 5.55 16.43 5.87L16.38 5.92C15.98 6.32 15.87 6.92 16.1 7.43V7.5C16.32 8 16.81 8.33 17.36 8.33H17.5C18.42 8.33 19.17 9.08 19.17 10C19.17 10.92 18.42 11.67 17.5 11.67H17.43C16.88 11.67 16.38 12 16.17 12.5Z" />
  </Icon>
)

export const LogoutIcon = ({ className = '', ...p }: IconProps) => (
  <Icon className={`icon-rtl-mirror ${className}`.trim()} {...p}>
    <path d="M7.5 17.5H4.17C3.25 17.5 2.5 16.75 2.5 15.83V4.17C2.5 3.25 3.25 2.5 4.17 2.5H7.5M13.33 14.17L17.5 10L13.33 5.83M17.5 10H7.5" />
  </Icon>
)

export const PencilIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.17 2.5C15.09 1.58 16.58 1.58 17.5 2.5C18.42 3.42 18.42 4.91 17.5 5.83L6.25 17.08L1.67 18.33L2.92 13.75L14.17 2.5Z" />
  </Icon>
)

export const PinIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="8.33" r="2.5" />
    <path d="M16.25 8.33C16.25 14.17 10 17.92 10 17.92C10 17.92 3.75 14.17 3.75 8.33C3.75 4.88 6.55 2.08 10 2.08C13.45 2.08 16.25 4.88 16.25 8.33Z" />
  </Icon>
)

export const LoginIcon = ({ className = '', ...p }: IconProps) => (
  <Icon className={`icon-rtl-mirror ${className}`.trim()} {...p}>
    <path d="M12.5 2.5H15.83C16.75 2.5 17.5 3.25 17.5 4.17V15.83C17.5 16.75 16.75 17.5 15.83 17.5H12.5M8.33 14.17L12.5 10L8.33 5.83M12.5 10H2.5" />
  </Icon>
)

/** Success mark for confirmed attendance actions. */
export const CheckCircleIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="7.92" />
    <path d="M6.67 10.21L8.96 12.5L13.33 7.92" />
  </Icon>
)

/** Error / attention mark. */
export const AlertIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="7.92" />
    <path d="M10 6.25V10.42M10 13.75H10.01" />
  </Icon>
)

/** Theme toggle: shown while in dark mode (switches to light). */
export const SunIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="3.33" />
    <path d="M10 1.67V3.33M10 16.67V18.33M4.11 4.11L5.29 5.29M14.71 14.71L15.89 15.89M1.67 10H3.33M16.67 10H18.33M4.11 15.89L5.29 14.71M14.71 5.29L15.89 4.11" />
  </Icon>
)

/** Theme toggle: shown while in light mode (switches to dark). */
export const MoonIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M17.5 10.66A7.5 7.5 0 1 1 9.34 2.5 5.83 5.83 0 0 0 17.5 10.66Z" />
  </Icon>
)

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9.17" cy="9.17" r="5.83" />
    <path d="M17.5 17.5L13.33 13.33" />
  </Icon>
)

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 4.17V15.83M4.17 10H15.83" />
  </Icon>
)

export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 7.5L10 12.5L15 7.5" />
  </Icon>
)

/** Horizontal "more" (⋯): row actions. */
export const MoreIcon = (p: IconProps) => (
  <Icon stroke="none" fill="currentColor" {...p}>
    <circle cx="4.17" cy="10" r="1.5" />
    <circle cx="10" cy="10" r="1.5" />
    <circle cx="15.83" cy="10" r="1.5" />
  </Icon>
)

/** Small status glyphs (approval badges, action menus). */
export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.17 10.42L8.13 14.17L15.83 5.83" />
  </Icon>
)

export const XIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.42 5.42L14.58 14.58M14.58 5.42L5.42 14.58" />
  </Icon>
)
