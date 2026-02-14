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
		// Pattern: exactly 4 digits (e.g., "2024")
		if (/^\d{4}$/.test(trimmed)) {
			return trimmed; // Return as-is, no formatting needed
		}

		// Handle year-month format (YYYY-MM)
		// Pattern: 4 digits, hyphen, 2 digits (e.g., "2024-01")
		const yearMonthMatch = trimmed.match(/^(\d{4})-(\d{2})$/);
		if (yearMonthMatch) {
			const [, year, month] = yearMonthMatch; // Extract year and month from regex groups
			// Create date on first day of month for consistent parsing
			const date = new Date(`${year}-${month}-01`);
			if (!Number.isNaN(date.getTime())) {
				return date.toLocaleDateString('en-AU', {
					month: 'long', // "January" instead of "01"
					year: 'numeric', // "2024"
				});
			}
		}

		// Handle full dates (with or without time component)
		// Examples: "2024-01-15" or "2024-01-15T10:30:00Z"
		// Strip time component if present for cleaner display (we only show the date part)
		const dateOnly = trimmed.split('T')[0]; // Split on 'T' and take first part
		const date = new Date(dateOnly);

		// Check if date is valid (invalid dates have NaN timestamp)
		if (Number.isNaN(date.getTime())) {
			return dateString; // Return original if parsing failed
		}

		// Format as "15 January 2024" (Australian date format)
		return date.toLocaleDateString('en-AU', {
			day: 'numeric', // "15"
			month: 'long', // "January"
			year: 'numeric', // "2024"
		});
	} catch {
		// Return original string if parsing fails (handles unexpected format errors)
		return dateString;
	}
}
