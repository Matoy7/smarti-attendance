import { useEffect, useRef, useState } from 'react'
import { IconButton, IconTile } from '@/components/ui'
import { PencilFilledIcon, PencilIcon, PinFilledIcon, PinIcon } from '@/components/icons'
import { useWorkLocation, withoutCountry, type WorkLocation } from '@/lib/location'
import { LocationDialog } from '@/components/location/LocationDialog'

type Props = {
  /**
   * footer = desktop card footer, edits in a centered modal;
   * tile = mobile inset tile, edits in a bottom drawer.
   * Same anatomy in both: pin badge, location details, edit button at the end.
   */
  variant: 'footer' | 'tile'
}

/** The saved work location with its edit entry point. */
export function LocationRow({ variant }: Props) {
  const location = useWorkLocation()
  const [editing, setEditing] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const editButton = useRef<HTMLButtonElement>(null)
  const wasEditing = useRef(false)

  // Return focus to the edit button once the dialog has unmounted and closed — while the modal
  // is still open the page behind it is inert and can't take focus.
  useEffect(() => {
    if (wasEditing.current && !editing) editButton.current?.focus()
    wasEditing.current = editing
  }, [editing])

  const close = () => setEditing(false)
  const saved = (next: WorkLocation) => {
    setAnnouncement(`המיקום עודכן: ${next.name}`)
    close()
  }

  const edit = (
    <IconButton
      ref={editButton}
      className={variant === 'tile' ? 'm-location-edit' : 'location-edit'}
      tone={variant === 'tile' ? 'ghost' : 'surface'}
      size={variant === 'tile' ? 'touch' : 'md'}
      label="שינוי מיקום"
      icon={variant === 'tile' ? <PencilIcon /> : <PencilFilledIcon />}
      aria-haspopup="dialog"
      aria-expanded={editing}
      onClick={() => {
        setAnnouncement('')
        setEditing(true)
      }}
    />
  )

  const dialog = editing && (
    <LocationDialog variant={variant === 'tile' ? 'drawer' : 'modal'} current={location} onClose={close} onSaved={saved} />
  )
  const live = (
    <span className="sr-only" role="status" aria-live="polite">
      {announcement}
    </span>
  )

  if (variant === 'tile') {
    return (
      <footer className="m-location">
        <IconTile icon={<PinIcon size={16} />} shape="round" />
        <span className="m-location-copy">
          <strong className="text-caption">מיקום: {location.name}</strong>
          <span className="text-micro text-tertiary">{withoutCountry(location.address)}</span>
        </span>
        {edit}
        {dialog}
        {live}
      </footer>
    )
  }

  return (
    <div className="location">
      <IconTile icon={<PinFilledIcon size={22} />} size="md" shape="round" className="location-pin" />
      <div className="location-copy">
        <strong className="text-body">מיקום: {location.name}</strong>
        <span className="text-small text-tertiary">{location.address}</span>
      </div>
      {edit}
      {dialog}
      {live}
    </div>
  )
}
