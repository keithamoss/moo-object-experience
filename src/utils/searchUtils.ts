/**
 * Utility functions for search state management
 */

import { ALL_SEARCHABLE_FIELD_NAMES, SearchableFieldName } from '../config/searchConfig';

/**
 * Parse and validate search fields from URL parameter
 * Returns all fields if param is null (initial state), otherwise parses the comma-separated list
 * 
 * Important distinction:
 * =====================
 * - fieldsParam === null: No fields parameter in URL (initial page load) → Default to all fields
 * - fieldsParam === '': Empty fields parameter in URL (user deselected all) → Return empty array
 * 
 * This allows us to distinguish between "no preference" vs "explicitly none selected"
 * 
 * @param fieldsParam - The fields URL parameter value (null if not present, string if present)
 * @returns Array of valid searchable field names (can be empty if explicitly set to empty)
 */
export function parseFieldsFromURL(fieldsParam: string | null): SearchableFieldName[] {
  if (fieldsParam !== null) {
    // Fields param exists - could be empty string (no fields) or comma-separated list
    // Use type guard for runtime validation and type safety
    const urlFields = fieldsParam
      .split(',')
      .filter(Boolean)
      .filter((f): f is SearchableFieldName => 
        ALL_SEARCHABLE_FIELD_NAMES.includes(f as SearchableFieldName)
      );
    return urlFields; // Allow empty array
  } else {
    // No fields param at all = initial mount, default to all
    return ALL_SEARCHABLE_FIELD_NAMES;
  }
}

/**
 * Check if two field arrays are equal (same fields in same order)
 * 
 * @param fields1 - First array of field names
 * @param fields2 - Second array of field names
 * @returns True if arrays contain the same fields in the same order
 */
export function areFieldArraysEqual(
  fields1: SearchableFieldName[],
  fields2: SearchableFieldName[]
): boolean {
  return (
    fields1.length === fields2.length &&
    fields1.every((field, index) => field === fields2[index])
  );
}

/**
 * Check if all searchable fields are selected
 * 
 * Why this check?
 * ===============
 * For cleaner URLs, we omit the fields parameter when all fields are selected.
 * This makes the URL simpler: ?q=dogs instead of ?q=dogs&fields=title,description,creator,alternative
 * 
 * @param fields - Array of field names to check
 * @returns True if all searchable fields are present
 */
export function areAllFieldsSelected(fields: SearchableFieldName[]): boolean {
  return (
    fields.length === ALL_SEARCHABLE_FIELD_NAMES.length &&
    fields.every((f) => ALL_SEARCHABLE_FIELD_NAMES.includes(f))
  );
}
