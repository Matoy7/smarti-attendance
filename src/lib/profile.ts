import type { Permission } from './permissions'

/** Demo user and work location shown on the attendance screen (no backend yet). */
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
  /** Mobile design shows the address without the country. */
  shortAddress: "ליאונרדו דה וינצ'י 21, תל אביב-יפו",
}
