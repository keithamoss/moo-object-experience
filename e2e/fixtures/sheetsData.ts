/**
 * Mock data for Google Sheets API responses.
 *
 * The Mappings response is a frozen snapshot of real schema data.
 * The Museum response is built from the typed object factory.
 *
 * To update schema: run `npm run fixtures:update`
 * To add/edit test objects: edit `e2e/fixtures/factory.ts`
 */

import type { SheetsApiResponse } from '../../src/types/metadata';
import { buildMuseumResponse, defaultObjects } from './factory';
import { mappingsSnapshot, schemaFieldOrder } from './mappings.snapshot';

// Re-export factory utilities so test files can import from one place.
export { buildMuseumResponse, createObject } from './factory';

/** Mappings worksheet — frozen snapshot of the real schema. */
export const mockMappingsResponse: SheetsApiResponse = mappingsSnapshot;

/** Museum worksheet — all pre-baked objects in a valid API response. */
export const mockMuseumResponse: SheetsApiResponse = buildMuseumResponse(defaultObjects);

/** Museum worksheet — header row only (no objects), for empty-state tests. */
export const mockEmptyMuseumResponse: SheetsApiResponse = {
	range: 'Museum!A1:Z1',
	majorDimension: 'ROWS',
	values: [schemaFieldOrder],
};

/**
 * Mappings worksheet with intentionally malformed data (missing required columns).
 * Used to test the error boundary when the schema is unrecognisable.
 */
export const mockMalformedMappingsResponse: SheetsApiResponse = {
	range: 'Mappings!A1:C3',
	majorDimension: 'ROWS',
	values: [
		['field', 'namespace', 'label'],
		['dcterms:identifier.moooi', 'Dublin Core', 'Identifier'],
	],
};
