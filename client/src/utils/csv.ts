/**
 * Minimal CSV writer for exporting already-loaded, flat row data (no
 * streaming, no external dependency — the data driving Reports/export is
 * trip-wallet sized, not bulk). Handles the RFC 4180 cases that actually
 * come up here: commas, quotes, and newlines inside a field.
 */

export interface CsvColumn<T> {
  key: keyof T | ((row: T) => string | number | null | undefined)
  label: string
}

function escapeCsvField(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvField(c.label)).join(',')
  const lines = rows.map((row) =>
    columns
      .map((c) => escapeCsvField(typeof c.key === 'function' ? c.key(row) : (row[c.key] as string | number | null | undefined)))
      .join(','),
  )
  return [header, ...lines].join('\r\n')
}
