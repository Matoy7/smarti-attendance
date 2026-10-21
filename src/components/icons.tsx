import type { SVGProps } from 'react'

/**
 * Outline icon set in the desktop sidebar's style (20×20 grid, ~1.6px rounded
 * strokes, currentColor). The first four are the desktop sidebar icons
 * (public/assets/*.svg) inlined so active/inactive states can recolor them.
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
