/**
 * Quote a value for CSV and neutralise spreadsheet formula injection
 * (cells starting with = + - @ TAB CR are executed by Excel/Sheets).
 */
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
