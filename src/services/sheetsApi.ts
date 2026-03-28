/**
 * Google Sheets API service for fetching metadata schema and object data
 */

import { SHEETS_CONFIG } from '../config/sheets';
import { OBJECT_FIELDS, toFieldKey } from '../constants/objectFields';
import type { MetadataSchema, ObjectData, SheetsApiResponse } from '../types/metadata';

/**
 * Build the URL for fetching a specific worksheet
 */
function buildSheetUrl(worksheetName: string): string {
	const { baseUrl, sheetId, apiKey } = SHEETS_CONFIG;
	return `${baseUrl}/${sheetId}/values/${encodeURIComponent(worksheetName)}?key=${apiKey}`;
}

/**
 * Fetch data from a Google Sheet worksheet
 */
async function fetchSheetData(worksheetName: string): Promise<string[][]> {
	const url = buildSheetUrl(worksheetName);

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch ${worksheetName}: ${response.status} ${response.statusText}`);
	}

	const data: SheetsApiResponse = await response.json();

	if (!data.values || data.values.length === 0) {
		throw new Error(`No data found in ${worksheetName} worksheet`);
	}

	return data.values;
}

/**
 * Parse the Mappings worksheet into a structured metadata schema
 */
export function parseMetadataSchema(rows: string[][]): MetadataSchema {
	if (rows.length < 2) {
		throw new Error('Mappings sheet must have at least a header row and one data row');
	}

	// First row contains headers
	const headers = rows[0];

	// Map headers to their indices (case-insensitive, flexible matching)
	// This allows us to find columns even if the user changes capitalization
	// or adds/removes whitespace in the header names
	const headerMap = new Map<string, number>();
	headers.forEach((header, index) => {
		const normalized = header.toLowerCase().trim();
		headerMap.set(normalized, index);
	});

	// Required headers with flexible matching patterns
	const requiredHeaders = [
		{ key: 'field', patterns: ['field'] },
		{ key: 'namespace', patterns: ['namespace'] },
		{ key: 'label', patterns: ['label'] },
		{ key: 'applicableCollections', patterns: ['applicable collections'] },
		{ key: 'required', patterns: ['required'] },
		{ key: 'purpose', patterns: ['purpose'] },
		{ key: 'fieldTypeAndControls', patterns: ['field type'] },
		{ key: 'example', patterns: ['example'] },
	];

	// Find column indices for each required header
	// We search for flexible patterns to handle minor variations in header names
	// (e.g., "Field Type" vs "field type and controls")
	const columnIndices: Record<string, number> = {};
	const missingHeaders: string[] = [];

	for (const { key, patterns } of requiredHeaders) {
		let found = false;
		// Try each pattern variation until we find a match
		for (const pattern of patterns) {
			// Look for headers that contain the pattern (partial match)
			const matchingHeader = Array.from(headerMap.entries()).find(([header]) => header.includes(pattern));
			if (matchingHeader) {
				columnIndices[key] = matchingHeader[1]; // Store the column index
				found = true;
				break; // Stop searching once we find a match
			}
		}
		if (!found) {
			missingHeaders.push(patterns[0]); // Track first pattern name for error reporting
		}
	}

	// Throw error if critical columns are missing
	if (missingHeaders.length > 0) {
		throw new Error(
			`Mappings sheet is missing required columns: ${missingHeaders.join(', ')}. ` +
				`Found columns: ${headers.join(', ')}`,
		);
	}

	// Parse data rows using the column mapping
	// This approach makes the code resilient to column reordering in the sheet
	const schema: MetadataSchema = rows
		.slice(1) // Skip header row
		.filter((row) => row[columnIndices.field] && row[columnIndices.field].trim() !== '') // Filter out empty rows (rows without a field name)
		.map((row) => ({
			// Use columnIndices lookup for each field, defaulting to empty string if missing
			// This handles sparse data gracefully (missing cells show as empty string)
			field: toFieldKey(row[columnIndices.field] || ''),
			namespace: row[columnIndices.namespace] || '',
			label: row[columnIndices.label] || '',
			applicableCollections: row[columnIndices.applicableCollections] || '',
			required: row[columnIndices.required] || '',
			purpose: row[columnIndices.purpose] || '',
			fieldTypeAndControls: row[columnIndices.fieldTypeAndControls] || '',
			example: row[columnIndices.example] || '',
		}));

	// §1 — Validate that all critical application fields are present in the schema
	// All field names present in the parsed schema
	const allFieldNames = new Set(schema.map((f) => f.field));

	// Every OBJECT_FIELDS value must be present
	const criticalFields = Object.values(OBJECT_FIELDS);
	const missingCritical = criticalFields.filter((f) => !allFieldNames.has(f));

	if (missingCritical.length > 0) {
		throw new Error(
			`Mappings sheet is missing critical application fields: ${missingCritical.join(', ')}. ` +
				'These fields are used in application logic (see OBJECT_FIELDS in objectFields.ts). ' +
				'If a field was intentionally renamed, update OBJECT_FIELDS to match.',
		);
	}

	return schema;
}

/**
 * Parse the Museum (objects) worksheet into structured object data
 */
export function parseObjectsData(rows: string[][], schema: MetadataSchema): ObjectData[] {
	if (rows.length < 2) {
		throw new Error('Museum sheet must have at least a header row and one data row');
	}

	// First row contains field names (should match schema field names).
	// toFieldKey() is the sole authorized boundary where raw sheet strings
	// become typed field keys. The §1 validation in parseMetadataSchema
	// (SHEETSAPI_IMPROVEMENTS.md) will guard these before this point is reached.
	const fieldNames = rows[0].map(toFieldKey);

	// §3 — Find the index of the identifier field
	const identifierIndex = fieldNames.indexOf(OBJECT_FIELDS.IDENTIFIER);

	if (identifierIndex === -1) {
		throw new Error(
			`Museum sheet header row is missing required field "${OBJECT_FIELDS.IDENTIFIER}". ` +
				'This field must be present as a column header. Check that the Museum sheet uses the same field names as the Mappings sheet.',
		);
	}

	// Compute both field sets once — used by both §4 and §5 below.
	const museumFieldSet = new Set(fieldNames);
	const schemaFieldSet = new Set(schema.map((f) => f.field));

	// §4 — Validate that every OBJECT_FIELDS entry that is present in the Mappings schema is
	// also present as a Museum column. Non-critical Mappings fields (e.g. dwc.higherGeography)
	// may legitimately be absent from the Museum sheet and do not trigger this check.
	// Note: §1 in parseMetadataSchema guarantees all OBJECT_FIELDS are in the schema in
	// production; the intersection here keeps tests that use minimal schemas working correctly.
	const criticalFieldsInSchema = Object.values(OBJECT_FIELDS).filter((f) => schemaFieldSet.has(f));
	const missingCriticalInMuseum = criticalFieldsInSchema.filter((f) => !museumFieldSet.has(f));

	if (missingCriticalInMuseum.length > 0) {
		throw new Error(
			`Museum sheet is missing critical columns: ${missingCriticalInMuseum.join(', ')}. ` +
				'These fields are required by the application. Check that the Museum sheet uses the same field names as the Mappings sheet.',
		);
	}

	// §5 — Validate that every Museum column is described in Mappings.
	// An undocumented column would be imported into the store but never displayed
	// (the detail page iterates schema fields, not object keys). Fail loudly instead.
	const undocumentedInMuseum = [...museumFieldSet].filter((f) => !schemaFieldSet.has(f));

	if (undocumentedInMuseum.length > 0) {
		throw new Error(
			`Museum sheet has columns not described in Mappings: ${undocumentedInMuseum.join(', ')}. ` +
				'Either add those fields to the Mappings sheet, or remove those columns from the Museum sheet.',
		);
	}

	// Parse data rows (skip header)
	const objects: ObjectData[] = rows
		.slice(1) // Skip header row
		.filter((row) => {
			// Only include rows that have a non-empty identifier (required field)
			// This filters out template rows, divider rows, or incomplete entries
			const identifier = row[identifierIndex];
			if (!identifier || identifier.trim() === '') {
				return false;
			}
			return true;
		})
		.map((row) => {
			// Build object dynamically from row data
			const obj: ObjectData = {};

			// Map each column to its field name from the header
			fieldNames.forEach((fieldName, index) => {
				// Skip columns with empty/missing headers (shouldn't happen but be defensive)
				if (fieldName && fieldName.trim() !== '') {
					obj[fieldName] = row[index] || ''; // Store cell value, or empty string if cell is missing
				}
			});

			// Validate required fields exist
			const identifier = obj[OBJECT_FIELDS.IDENTIFIER];
			if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
				throw new Error(`Object missing required identifier field`);
			}

			return obj;
		});

	// §2 — Check for duplicate identifiers
	const seen = new Set<string>();
	const duplicates: string[] = [];

	for (const obj of objects) {
		const id = obj[OBJECT_FIELDS.IDENTIFIER] as string;
		if (seen.has(id)) {
			duplicates.push(id);
		} else {
			seen.add(id);
		}
	}

	if (duplicates.length > 0) {
		throw new Error(
			`Museum sheet contains duplicate object identifiers: ${duplicates.join(', ')}. ` +
				'Each object must have a unique identifier. Fix the source data and reload.',
		);
	}

	return objects;
}

/**
 * Fetch and parse the metadata schema from the Mappings worksheet
 */
export async function fetchMetadataSchema(): Promise<MetadataSchema> {
	const rows = await fetchSheetData(SHEETS_CONFIG.worksheets.metadata);
	return parseMetadataSchema(rows);
}

/**
 * Fetch and parse object data from the Museum worksheet
 */
export async function fetchObjects(schema: MetadataSchema): Promise<ObjectData[]> {
	const rows = await fetchSheetData(SHEETS_CONFIG.worksheets.objects);
	return parseObjectsData(rows, schema);
}

/**
 * Fetch both metadata schema and objects in sequence
 * (metadata must be fetched first to properly parse objects)
 */
export async function fetchAllData(): Promise<{
	schema: MetadataSchema;
	objects: ObjectData[];
}> {
	const schema = await fetchMetadataSchema();
	const objects = await fetchObjects(schema);

	return { schema, objects };
}
