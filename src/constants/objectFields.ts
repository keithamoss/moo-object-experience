/**
 * Object field name constants
 * Centralized field names to avoid magic strings
 */

export const OBJECT_FIELDS = {
  IDENTIFIER: 'dcterms:identifier.moooi',
  TITLE: 'dcterms:title',
  DESCRIPTION: 'dcterms:description',
  CREATOR: 'dcterms:creator',
  COLLECTION: 'dcterms:Collection',
  DATE_ACCEPTED: 'dcterms:dateAccepted',
  IMAGE: 'dcterms:image',
  ALTERNATIVE: 'dcterms:alternative',
} as const;

export type ObjectFieldName = (typeof OBJECT_FIELDS)[keyof typeof OBJECT_FIELDS];
