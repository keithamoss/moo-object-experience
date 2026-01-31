/**
 * Search configuration
 * Defines which fields are searchable and their relative weights for ranking
 */

export interface SearchableField {
  /** The field name from the metadata schema */
  fieldName: string;
  /** Weight for search ranking (higher = more important) */
  weight: number;
}

/**
 * Hardcoded searchable fields with weights
 * 
 * Weight meanings:
 * - 3 = High priority (title)
 * - 2 = Medium-high priority (alternative title, creator)
 * - 1 = Medium priority (description)
 */
export const SEARCHABLE_FIELDS: SearchableField[] = [
  {
    fieldName: 'dcterms:title',
    weight: 3,
  },
  {
    fieldName: 'dcterms:alternative',
    weight: 2,
  },
  {
    fieldName: 'dcterms:creator',
    weight: 2,
  },
  {
    fieldName: 'dcterms:description',
    weight: 1,
  },
];

/**
 * Get all searchable field names
 */
export function getSearchableFieldNames(): string[] {
  return SEARCHABLE_FIELDS.map(f => f.fieldName);
}

/**
 * Get weight for a specific field (returns 0 if not searchable)
 */
export function getFieldWeight(fieldName: string): number {
  const field = SEARCHABLE_FIELDS.find(f => f.fieldName === fieldName);
  return field?.weight ?? 0;
}

/**
 * Check if a field is searchable
 */
export function isFieldSearchable(fieldName: string): boolean {
  return SEARCHABLE_FIELDS.some(f => f.fieldName === fieldName);
}
