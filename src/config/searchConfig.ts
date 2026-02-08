/**
 * Search configuration
 * Defines searchable fields, weights, and search parameters
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
export const SEARCHABLE_FIELDS = [
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
] as const;

/**
 * Type-safe searchable field name (union of literal types)
 */
export type SearchableFieldName = (typeof SEARCHABLE_FIELDS)[number]['fieldName'];

/**
 * Array of all searchable field names
 */
export const ALL_SEARCHABLE_FIELD_NAMES: SearchableFieldName[] = SEARCHABLE_FIELDS.map((f) => f.fieldName);

/**
 * Map of field names to weights for O(1) lookup
 */
export const FIELD_WEIGHTS: Record<SearchableFieldName, number> = Object.fromEntries(
	SEARCHABLE_FIELDS.map((f) => [f.fieldName, f.weight])
) as Record<SearchableFieldName, number>;

/**
 * Minimum query length for search (characters)
 */
export const MIN_QUERY_LENGTH = 2;

/**
 * Fuzzy matching tolerance (0-1)
 * 0 = exact match only, 1 = very fuzzy
 */
export const FUZZY_TOLERANCE = 0.2;

/**
 * Search combine mode for multiple terms
 */
export const SEARCH_COMBINE_MODE = 'AND' as const;

/**
 * Debounce delay for search input (milliseconds)
 */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Get weight for a specific field (returns 0 if not searchable)
 */
export function getFieldWeight(fieldName: SearchableFieldName): number {
	return FIELD_WEIGHTS[fieldName] ?? 0;
}

/**
 * Check if a field is searchable
 */
export function isFieldSearchable(fieldName: string): fieldName is SearchableFieldName {
	return ALL_SEARCHABLE_FIELD_NAMES.includes(fieldName as SearchableFieldName);
}
