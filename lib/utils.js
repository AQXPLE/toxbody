import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date display cleanly
 * Handles null/undefined by returning "Historical / Date unavailable"
 */
export function formatOutreachDate(dateString, timezone = 'America/Chicago') {
  if (!dateString) {
    return 'Historical / Date unavailable';
  }

  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Historical / Date unavailable';

    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch (e) {
    return 'Historical / Date unavailable';
  }
}

export function formatShortDate(dateString, timezone = 'America/Chicago') {
  if (!dateString) return 'Historical';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Historical';
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch (e) {
    return 'Historical';
  }
}

/**
 * Export array of records to CSV file download
 */
export function downloadAsCsv(filename, rows) {
  if (!rows || !rows.length) return;

  const keys = Object.keys(rows[0]);
  const csvContent = [
    keys.join(','),
    ...rows.map((row) =>
      keys
        .map((k) => {
          let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
          val = val.replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
