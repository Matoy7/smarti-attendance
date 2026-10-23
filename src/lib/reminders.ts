import { useSyncExternalStore } from 'react'

/**
 * Reminders to submit the monthly attendance report (שליחת תזכורת).
 *
 * Delivered through the app's own notification channel: a reminder is saved for the employee and
 * month (this browser's localStorage — no backend yet) and the employee's app shows it as a
 * notification on הדיווחים שלי (lib/notifications.ts) until the report is submitted. There is no
 * email / SMS service, so nothing is sent outside the app.
 */
export type Reminder = { sentAt: string } // ISO timestamp of the latest reminder
type Reminders = Readonly<Record<string, Reminder>> // "YYYY-MM:employeeId" → reminder

const STORAGE_KEY = 'smartime.reminders.v1'
const key = (month: string, employeeId: string) => `${month}:${employeeId}`

function read(): Reminders {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

let reminders: Reminders = read()
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY && e.key !== null) return
    reminders = read()
    onChange()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onStorage)
  }
}

export function useReminders(): Reminders {
  return useSyncExternalStore(subscribe, () => reminders)
}

export const reminderFor = (all: Reminders, month: string, employeeId: string): Reminder | undefined => all[key(month, employeeId)]

export class ReminderError extends Error {}

/**
 * Saves a reminder for each employee for the month and verifies the write. Resolves with the
 * time it was saved; rejects (and saves nothing) when storage fails — the UI then reports failure.
 */
export async function sendReminders(month: string, employeeIds: string[]): Promise<Date> {
  if (!employeeIds.length) throw new ReminderError('no recipients')
  const at = new Date()
  const next: Record<string, Reminder> = { ...read() }
  employeeIds.forEach((id) => (next[key(month, id)] = { sentAt: at.toISOString() }))
  try {
    const raw = JSON.stringify(next)
    localStorage.setItem(STORAGE_KEY, raw)
    if (localStorage.getItem(STORAGE_KEY) !== raw) throw new Error('not saved')
  } catch {
    throw new ReminderError('storage')
  }
  reminders = next
  listeners.forEach((l) => l())
  return at
}
