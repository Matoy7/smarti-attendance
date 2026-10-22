import type { Permission } from './permissions'

/** Demo user and the default work location (no backend yet; a saved location overrides it, see lib/location.ts). */
export const USER = {
  firstName: 'מיכל',
  fullName: 'מיכל לוי',
  role: 'מנהלת פרויקטים',
  /** Demo permissions (no auth backend yet). A manager sees organizational management. */
  permissions: ['org.attendance.manage'] as Permission[],
}

export const LOCATION = {
  name: 'משרדי החברה (תל אביב)',
  address: "ליאונרדו דה וינצ'י 21, תל אביב-יפו, ישראל",
}
