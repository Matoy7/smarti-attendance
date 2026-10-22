import { IconButton, IconTile } from '@/components/ui'
import { MoreVerticalIcon, PencilIcon, PinIcon } from '@/components/icons'

type Props = {
  /**
   * footer = desktop card footer (centered, pencil at the start);
   * tile = mobile inset tile (pin badge, menu button at the end)
   */
  variant: 'footer' | 'tile'
  name: string
  address: string
}

/** The work location with an entry point to change it (no location picker yet). */
export function LocationRow({ variant, name, address }: Props) {
  if (variant === 'tile') {
    return (
      <footer className="m-location">
        <IconTile icon={<PinIcon size={16} />} shape="round" />
        <span className="m-location-copy">
          <strong className="text-caption">מיקום: {name}</strong>
          <span className="text-micro text-tertiary">{address}</span>
        </span>
        <IconButton className="m-location-more" size="touch" label="שינוי מיקום" icon={<MoreVerticalIcon />} />
      </footer>
    )
  }

  return (
    <div className="location">
      <IconButton label="ערוך מיקום" icon={<PencilIcon />} />
      <div className="location-copy">
        <strong className="text-body">מיקום: {name}</strong>
        <span className="text-small text-tertiary">{address}</span>
      </div>
    </div>
  )
}
