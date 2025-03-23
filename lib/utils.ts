import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Utility function to format date and time based on locale preferences
 * Default locale is set to Brazilian Portuguese (pt-BR)
 */
export const formatDateTime = (
    date: Date | string | number,
    options?: {
      locale?: string;
      includeTime?: boolean;
      includeSeconds?: boolean;
      use24HourFormat?: boolean;
    }
) => {
  // Default options
  const defaultOptions = {
    locale: 'pt-BR',
    includeTime: true,
    includeSeconds: false,
    use24HourFormat: true,
  };

  // Merge provided options with defaults
  const mergedOptions = { ...defaultOptions, ...options };

  // Convert various date formats to Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  // Detect if the date is invalid
  if (isNaN(dateObj.getTime())) {
    return {
      dateTime: 'Invalid date',
      dateOnly: 'Invalid date',
      timeOnly: 'Invalid date',
    };
  }

  // Configure date formatting options
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  // Configure time formatting options
  const timeFormatOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: mergedOptions.includeSeconds ? '2-digit' : undefined,
    hour12: !mergedOptions.use24HourFormat,
  };

  // Combined date and time options
  const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
    ...dateFormatOptions,
    ...(mergedOptions.includeTime ? timeFormatOptions : {}),
  };

  // Format date and time according to the specified locale
  const formatter = new Intl.DateTimeFormat(mergedOptions.locale, dateTimeFormatOptions);
  const dateOnlyFormatter = new Intl.DateTimeFormat(mergedOptions.locale, dateFormatOptions);
  const timeOnlyFormatter = mergedOptions.includeTime
      ? new Intl.DateTimeFormat(mergedOptions.locale, timeFormatOptions)
      : null;

  return {
    dateTime: formatter.format(dateObj),
    dateOnly: dateOnlyFormatter.format(dateObj),
    timeOnly: timeOnlyFormatter ? timeOnlyFormatter.format(dateObj) : '',
  };
};

// Examples of usage:
//
// Basic usage (Brazilian format by default)
// formatDateTime(new Date())
// Output: { dateTime: '25/03/2025 14:30', dateOnly: '25/03/2025', timeOnly: '14:30' }
//
// US format
// formatDateTime(new Date(), { locale: 'en-US', use24HourFormat: false })
// Output: { dateTime: '03/25/2025 2:30 PM', dateOnly: '03/25/2025', timeOnly: '2:30 PM' }
//
// Date only (no time)
// formatDateTime(new Date(), { includeTime: false })
// Output: { dateTime: '25/03/2025', dateOnly: '25/03/2025', timeOnly: '' }
//
// With seconds
// formatDateTime(new Date(), { includeSeconds: true })
// Output: { dateTime: '25/03/2025 14:30:45', dateOnly: '25/03/2025', timeOnly: '14:30:45' }