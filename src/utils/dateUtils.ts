/**
 * Date utility functions
 */

/**
 * Format ISO8601 date to human-readable format
 * 
 * Handles various ISO8601 formats:
 * - Full dates: "2024-01-15" → "15 January 2024"
 * - Year-month: "2024-01" → "January 2024"
 * - Year only: "2024" → "2024"
 * - Date with time: "2024-01-15T10:30:00Z" → "15 January 2024"
 * - Invalid dates: returned as-is
 * 
 * @param dateString - ISO8601 date string
 * @returns Human-readable date in Australian format
 */
export function formatDate(dateString: string): string {
  if (!dateString || typeof dateString !== 'string') {
    return dateString;
  }

  const trimmed = dateString.trim();

  try {
    // Handle year-only format (YYYY)
    if (/^\d{4}$/.test(trimmed)) {
      return trimmed;
    }

    // Handle year-month format (YYYY-MM)
    const yearMonthMatch = trimmed.match(/^(\d{4})-(\d{2})$/);
    if (yearMonthMatch) {
      const [, year, month] = yearMonthMatch;
      const date = new Date(`${year}-${month}-01`);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-AU', {
          month: 'long',
          year: 'numeric',
        });
      }
    }

    // Handle full dates (with or without time component)
    // Strip time component if present for cleaner display
    const dateOnly = trimmed.split('T')[0];
    const date = new Date(dateOnly);
    
    if (isNaN(date.getTime())) {
      return dateString;
    }

    // Format as "15 January 2024"
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    // Return original string if parsing fails
    return dateString;
  }
}
