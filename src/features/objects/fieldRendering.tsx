import { Box, Chip } from '@mui/material';
import { formatDate } from '../../utils/dateUtils';

/**
 * Renders a field value based on its type from metadata
 *
 * Field type handling:
 * - **URLs** (fieldTypeAndControls includes "url" OR value starts with http/https): Clickable link in new tab
 * - **Dates** (fieldTypeAndControls includes "date"): Formatted as "15 January 2024" (Australian format)
 * - **Comma-separated lists** (fieldTypeAndControls includes "comma-separated"): Material-UI chips (if 2+ items)
 * - **Multi-line text**: Preserves line breaks with <br> tags
 * - **Empty values**: Returns null
 *
 * @param value - Field value from object data
 * @param fieldTypeAndControls - Field type metadata from schema (e.g., "Free text", "URL", "ISO8601 compliant date", "Image", "Comma-separated list of terms (controlled)")
 * @returns React node or null
 */
export function renderFieldValue(
  value: string | undefined,
  fieldTypeAndControls: string,
): React.ReactNode {
  if (!value || value.trim() === '') {
    return null;
  }

  const trimmedValue = value.trim();
  const type = fieldTypeAndControls.toLowerCase();

  // URLs: Make clickable links
  if (
    type.includes('url') ||
    trimmedValue.startsWith('http://') ||
    trimmedValue.startsWith('https://')
  ) {
    return (
      <a href={trimmedValue} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
        {trimmedValue}
      </a>
    );
  }

  // Dates: Format to human-readable
  if (type.includes('date')) {
    return formatDate(trimmedValue);
  }

  // Comma-separated lists: Display as chips
  if (type.includes('comma-separated') || type.includes('comma separated')) {
    const items = trimmedValue
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (items.length > 1) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {items.map((item, idx) => (
            <Chip key={idx} label={item} size="small" />
          ))}
        </Box>
      );
    }
  }

  // Default: Display as plain text with line breaks preserved
  return trimmedValue.split('\n').map((line, idx) => (
    <span key={idx}>
      {line}
      {idx < trimmedValue.split('\n').length - 1 && <br />}
    </span>
  ));
}
