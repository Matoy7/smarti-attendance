/** Permission keys. Every authenticated employee has the personal area; these gate the rest. */
export type Permission = 'org.attendance.manage'

export function hasPermission(user: { permissions: readonly Permission[] }, permission: Permission): boolean {
  return user.permissions.includes(permission)
}
