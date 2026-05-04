export interface CsvColumn<T> {
  key: keyof T | string;
  header: string;
  value?: (row: T) => unknown;
}

export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const normalized = typeof value === 'object' ? JSON.stringify(value) : String(value);
  const escaped = normalized.replace(/"/g, '""');
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((column) => csvEscape(column.header)).join(',');
  const lines = rows.map((row) =>
    columns
      .map((column) => {
        const raw = column.value ? column.value(row) : (row as Record<string, unknown>)[String(column.key)];
        return csvEscape(raw);
      })
      .join(','),
  );
  return [header, ...lines].join('\n');
}

export function downloadCsv(filename: string, csvText: string) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
