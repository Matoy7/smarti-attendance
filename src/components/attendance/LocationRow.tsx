import { IconButton, IconTile } from '@/components/ui'
import { PencilIcon, PinIcon } from '@/components/icons'

type Props = {
  /**
   * footer = desktop card footer; tile = mobile inset tile.
   * Same anatomy in both: pin badge, location details, edit button at the end.
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
        <IconButton className="m-location-edit" size="touch" label="שינוי מיקום" icon={<PencilIcon />} />
      </footer>
    )
  }

  return (
    <div className="location">
      <IconTile icon={<PinIcon size={18} />} size="md" shape="round" className="location-pin" />
      <div className="location-copy">
        <strong className="text-body">מיקום: {name}</strong>
        <span className="text-small text-tertiary">{address}</span>
      </div>
      <IconButton className="location-edit" tone="surface" label="שינוי מיקום" icon={<PencilIcon />} />
    </div>
  )
}
