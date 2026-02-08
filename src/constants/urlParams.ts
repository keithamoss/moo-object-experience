/**
 * URL parameter constants for search state
 * Used throughout the application for consistent URL state management
 */

export const URL_PARAMS = {
  /** Query string parameter (?q=search+term) */
  QUERY: 'q',
  /** Active search fields parameter (?fields=title,description) */
  FIELDS: 'fields',
} as const;
