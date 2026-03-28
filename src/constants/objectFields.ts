/**
 * Object field name constants
 * Centralized field names to avoid magic strings
 */

declare const __fieldBrand: unique symbol;

/**
 * A validated object field key. Raw string literals cannot be assigned to this
 * type — field names must come from OBJECT_FIELDS constants or go through
 * toFieldKey() at a validated schema boundary.
 */
export type FieldKey = string & { readonly [__fieldBrand]: true };

/**
 * Convert a raw string to a FieldKey. This is the only place in the codebase
 * where an `as FieldKey` cast is permitted. Call this only at validated data
 * boundaries (i.e. when reading field names from the Mappings/Museum sheets).
 * Throws on empty input to prevent blank keys entering the system.
 */
export function toFieldKey(s: string): FieldKey {
	if (!s || s.trim() === '') throw new Error(`Cannot create FieldKey from empty string`);
	return s as FieldKey;
}

export const OBJECT_FIELDS = {
	IDENTIFIER: 'dcterms:identifier.moooi' as FieldKey,
	TITLE: 'dcterms:title' as FieldKey,
	DESCRIPTION: 'dcterms:description' as FieldKey,
	CREATOR: 'dcterms:creator' as FieldKey,
	ALTERNATIVE: 'dcterms:alternative' as FieldKey,
	DATE_ACCEPTED: 'dcterms:dateAccepted' as FieldKey,
	FORMAT: 'dcterms:format' as FieldKey,
} as const;

export type ObjectFieldName = (typeof OBJECT_FIELDS)[keyof typeof OBJECT_FIELDS];
