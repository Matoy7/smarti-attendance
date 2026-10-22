/**
 * CSV export for spreadsheet apps.
 * - UTF-8 with BOM, so Excel shows Hebrew correctly when the file is opened directly.
 * - CRLF line endings; fields quoted when they contain a comma, quote or line break.
 * - Formula-injection guard: a cell starting with = + - @ (or tab / CR) is prefixed with ' so a
 *   spreadsheet treats it as text, never as a formula.
 */
const NEEDS_QUOTES = /[",\r\n]/
const FORMULA_START = /^[=+\-@\t\r]/

export function csvCell(value: string): string {
  let v = value
  if (FORMULA_START.test(v)) v = `'${v}`
  return NEEDS_QUOTES.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

export function toCsv(rows: string[][]): string {
  return '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n'
}

/** Saves `content` as a file in the browser (desktop: downloads; mobile: the system download / Files flow). */
export function downloadFile(fileName: string, content: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoke after the browser has started the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
