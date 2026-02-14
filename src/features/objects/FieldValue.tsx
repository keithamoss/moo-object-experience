import { Box, Chip } from '@mui/material';
import { formatDate } from '../../utils/dateUtils';

interface FieldValueProps {
	readonly value: string | undefined;
	readonly fieldTypeAndControls: string;
}

/**
 * Renderer type for field values
 */
type FieldRenderer = (value: string) => React.ReactNode;

/**
 * Render a URL as a clickable link
 * Shortens the display text for better readability while keeping full URL in href
 */
function renderUrl(value: string): React.ReactNode {
	const maxLength = 60;
	const displayText = value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;

	return (
		<a
			href={value}
			target="_blank"
			rel="noopener noreferrer"
			style={{ color: 'inherit', wordBreak: 'break-all' }}
			title={value}
		>
			{displayText}
		</a>
	);
}

/**
 * Render a date in human-readable format
 */
function renderDate(value: string): React.ReactNode {
	return formatDate(value);
}

/**
 * Render comma-separated values as chips
 */
function renderCommaSeparated(value: string): React.ReactNode {
	const items = value
		.split(',')
		.map((item) => item.trim())
		.filter((item) => item.length > 0);

	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
			{items.map((item) => (
				<Chip key={item} label={item} size="small" />
			))}
		</Box>
	);
}

/**
 * Render multi-line text with preserved line breaks
 */
function renderDefault(value: string): React.ReactNode {
	const lines = value.split('\n');
	return lines.map((line, idx) => (
		<span key={`line-${idx}-${line.substring(0, 20)}`}>
			{line}
			{idx < lines.length - 1 && <br />}
		</span>
	));
}

/**
 * Determine which renderer to use based on field type
 */
function getRenderer(fieldTypeAndControls: string): FieldRenderer {
	const type = fieldTypeAndControls.toLowerCase();

	switch (true) {
		case type.includes('url'):
			return renderUrl;
		case type.includes('date'):
			return renderDate;
		case type.includes('comma-separated') || type.includes('comma separated'):
			return renderCommaSeparated;
		default:
			return renderDefault;
	}
}

/**
 * Component for rendering a field value based on its type from the metadata schema
 *
 * Uses a strategy pattern to select the appropriate renderer based on
 * the field's metadata type. Field types are determined by the `fieldTypeAndControls`
 * value from the metadata schema.
 *
 * ## Supported Field Types
 *
 * ### 1. URL Fields
 * **Detection**: `fieldTypeAndControls` includes "url" (case-insensitive)
 * **Rendering**:
 * - Clickable link opening in new tab with security attributes (noopener, noreferrer)
 * - Display text truncated to 60 characters with ellipsis for readability
 * - Full URL shown on hover via title attribute
 * - Word breaks enabled for long URLs (wordBreak: 'break-all')
 * **Example**:
 * - Input: `"https://example.com/very/long/path/to/resource/file.jpg"`
 * - Display: `"https://example.com/very/long/path/to/resource/file...."`
 * - Hover: Shows full URL
 *
 * ### 2. Date Fields
 * **Detection**: `fieldTypeAndControls` includes "date" (case-insensitive)
 * **Rendering**:
 * - Human-readable Australian date format via `formatDate()` utility
 * - Supports multiple ISO8601 formats:
 *   - Full date: "2024-01-15" → "15 January 2024"
 *   - Year-month: "2024-01" → "January 2024"
 *   - Year only: "2024" → "2024"
 *   - Date with time: "2024-01-15T10:30:00Z" → "15 January 2024" (time component stripped)
 * - Invalid or malformed dates returned as-is
 * **Example**:
 * - Input: `"2024-03-15"`
 * - Display: `"15 March 2024"`
 *
 * ### 3. Comma-Separated Lists
 * **Detection**: `fieldTypeAndControls` includes "comma-separated" or "comma separated" (case-insensitive)
 * **Rendering**:
 * - Material-UI Chip components for each item (small size)
 * - Chips wrap to multiple lines on narrow screens (flexWrap: 'wrap')
 * - Empty items automatically filtered out after trimming
 * - 0.5 spacing units between chips
 * **Example**:
 * - Input: `"Ceramics, Pottery, Sculpture"`
 * - Display: Three chips with grey background: [Ceramics] [Pottery] [Sculpture]
 *
 * ### 4. Multi-Line Text (Default/Fallback)
 * **Detection**: All other field types (fallback when no specific type matches)
 * **Rendering**:
 * - Line breaks preserved using `<br>` tags
 * - No special formatting or truncation
 * - Displayed as plain text
 * **Example**:
 * - Input: `"First line\nSecond line\nThird line"`
 * - Display: Three separate lines with visual line breaks
 *
 * ### 5. Empty Values
 * **Detection**: `!value` or `value.trim() === ''`
 * **Rendering**: Returns `null` (field will not be displayed in UI)
 *
 * ## Architecture Notes
 * - Uses strategy pattern with separate renderer functions for each type
 * - `getRenderer()` selects appropriate renderer based on field type
 * - Each renderer is a pure function: `(value: string) => React.ReactNode`
 * - Rendering decision made once per field (no re-evaluation on re-renders)
 *
 * @param value - Field value from object data (may be undefined or empty)
 * @param fieldTypeAndControls - Field type metadata from schema (e.g., "Free text", "URL", "ISO8601 compliant date", "Comma-separated list")
 * @returns React node or null if value is empty
 */
export function FieldValue({ value, fieldTypeAndControls }: FieldValueProps): React.ReactNode {
	if (!value || value.trim() === '') {
		return null;
	}

	const trimmedValue = value.trim();

	// Use strategy pattern to select renderer
	const renderer = getRenderer(fieldTypeAndControls);
	return <>{renderer(trimmedValue)}</>;
}
