import { Box, Chip } from '@mui/material';
import { formatDate } from '../../utils/dateUtils';

interface FieldValueProps {
  value: string | undefined;
  fieldTypeAndControls: string;
}

/**
 * Renderer type for field values
 */
type FieldRenderer = (value: string) => React.ReactNode;

/**
 * Render a URL as a clickable link
 */
function renderUrl(value: string): React.ReactNode {
  return (
    <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
      {value}
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
      {items.map((item, idx) => (
        <Chip key={idx} label={item} size="small" />
      ))}
    </Box>
  );
}

/**
 * Render multi-line text with preserved line breaks
 */
function renderDefault(value: string): React.ReactNode {
  return value.split('\n').map((line, idx) => (
    <span key={idx}>
      {line}
      {idx < value.split('\n').length - 1 && <br />}
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
 * Component for rendering a field value based on its type
 *
 * Uses a strategy pattern to select the appropriate renderer based on
 * the field's metadata type.
 *
 * Field type rendering behavior:
 * - **URLs** (fieldTypeAndControls includes "url")
 *   → Clickable link opening in new tab
 * 
 * - **Dates** (fieldTypeAndControls includes "date")
 *   → Formatted as "15 January 2024" (Australian format)
 * 
 * - **Comma-separated lists** (fieldTypeAndControls includes "comma-separated")
 *   → Material-UI chips for each item
 * 
 * - **Multi-line text** (all other types)
 *   → Preserves line breaks with <br> tags
 * 
 * - **Empty values**
 *   → Returns null (field won't be displayed)
 *
 * @param value - Field value from object data
 * @param fieldTypeAndControls - Field type metadata from schema
 */
export function FieldValue({ value, fieldTypeAndControls }: FieldValueProps) {
  if (!value || value.trim() === '') {
    return null;
  }

  const trimmedValue = value.trim();

  // Use strategy pattern to select renderer
  const renderer = getRenderer(fieldTypeAndControls);
  return <>{renderer(trimmedValue)}</>;
}
