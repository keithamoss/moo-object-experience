#!/usr/bin/env node
/**
 * Capture script — fetches live worksheet data from the Google Sheets API
 * and writes frozen snapshots to:
 *   - e2e/fixtures/mappings.snapshot.ts   (Mappings schema)
 *   - e2e/fixtures/museum.snapshot.ts     (Museum column headers only)
 *
 * Usage:
 *   npm run fixtures:update
 *   npx tsx scripts/capture-fixtures.ts
 *
 * If you get a 403 error:
 *   The API key is restricted by HTTP referrer. Temporarily set the restriction
 *   to "None" in Google Cloud Console (APIs & Services → Credentials → your key),
 *   run this script, then restore the restriction.
 */

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHEETS_CONFIG } from '../src/config/sheets.ts';
import { OBJECT_FIELDS } from '../src/constants/objectFields.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_PATH = resolve(__dirname, '../e2e/fixtures/mappings.snapshot.ts');
const MUSEUM_OUTPUT_PATH = resolve(__dirname, '../e2e/fixtures/museum.snapshot.ts');

// ---------------------------------------------------------------------------
// Types (mirror SheetsApiResponse to avoid pulling in the whole src tree)
// ---------------------------------------------------------------------------

interface SheetsApiResponse {
	range: string;
	majorDimension: string;
	values: string[][];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Fetch a worksheet from the Google Sheets API.
 * Spoofs Referer so the API key restriction is satisfied when running locally.
 */
async function fetchWorksheet(url: string): Promise<SheetsApiResponse> {
	let response: Response;
	try {
		response = await fetch(url, {
			headers: { Referer: 'https://moo.keithandhelenmakestuff.com/' },
		});
	} catch (err) {
		console.error('Network error:', err instanceof Error ? err.message : String(err));
		process.exit(1);
	}

	if (!response.ok) {
		if (response.status === 403) {
			console.error(
				'\nError: 403 Forbidden.\n' +
					'The Referer header did not satisfy the API key restriction.\n' +
					'Check that the allowed domain in Google Cloud Console still matches:\n' +
					'  https://moo.keithandhelenmakestuff.com/',
			);
		} else {
			console.error(`Error: HTTP ${response.status} ${response.statusText}`);
		}
		process.exit(1);
	}

	return (await response.json()) as SheetsApiResponse;
}

async function main(): Promise<void> {
	const { apiKey, sheetId, baseUrl, worksheets } = SHEETS_CONFIG;

	// -------------------------------------------------------------------------
	// Step A — Fetch Mappings worksheet
	// -------------------------------------------------------------------------
	const mappingsUrl = `${baseUrl}/${sheetId}/values/${worksheets.metadata}?key=${apiKey}`;
	console.log(`Fetching ${worksheets.metadata} worksheet from Google Sheets…`);
	const data = await fetchWorksheet(mappingsUrl);

	if (!data.values || data.values.length < 2) {
		console.error('Error: Mappings sheet returned no data rows.');
		process.exit(1);
	}

	// Strip trailing/empty rows (e.g. spreadsheet returns blank rows at end)
	data.values = data.values.filter((row) => row[0]?.trim());

	// Field names are in column 0 of each data row (skip the header row)
	const schemaFieldOrder = data.values.slice(1).map((row) => row[0]);

	console.log(`\nCaptured ${schemaFieldOrder.length} fields:`);
	for (const field of schemaFieldOrder) {
		console.log(`  • ${field}`);
	}

	// Validate: confirm all OBJECT_FIELDS constants appear in the captured schema
	const knownFields = Object.values(OBJECT_FIELDS);
	const missing = knownFields.filter((f) => !schemaFieldOrder.includes(f));

	if (missing.length > 0) {
		console.warn('\nWarning: the following OBJECT_FIELDS constants were NOT found in the captured schema:');
		for (const f of missing) {
			console.warn(`  ✗ ${f}`);
		}
		console.warn('Update src/constants/objectFields.ts to match the real schema if field names have changed.');
	} else {
		console.log('\nAll OBJECT_FIELDS constants confirmed present in captured schema. ✓');
	}

	// Write Mappings snapshot
	const timestamp = new Date().toISOString();
	const content = generateSnapshotFile(data, timestamp);
	writeFileSync(OUTPUT_PATH, content, 'utf-8');
	console.log(`\nMappings snapshot written to e2e/fixtures/mappings.snapshot.ts`);
	console.log(`Captured at: ${timestamp}`);

	// -------------------------------------------------------------------------
	// Step B — Fetch Museum header row only (no object data leaves the sheet)
	// -------------------------------------------------------------------------
	const museumHeaderUrl = `${baseUrl}/${sheetId}/values/${encodeURIComponent(`${worksheets.objects}!1:1`)}?key=${apiKey}`;
	console.log(`\nFetching ${worksheets.objects} header row from Google Sheets…`);
	const museumData = await fetchWorksheet(museumHeaderUrl);

	const museumFields: string[] =
		museumData.values && museumData.values.length > 0 ? museumData.values[0].filter((f) => f.trim() !== '') : [];

	if (museumFields.length === 0) {
		console.warn('Warning: Museum header row returned no fields — snapshot not updated.');
	} else {
		console.log(`\nCaptured ${museumFields.length} Museum columns:`);
		for (const field of museumFields) {
			console.log(`  • ${field}`);
		}

		// -----------------------------------------------------------------------
		// §5 cross-sheet check — warn if Museum has columns not in Mappings
		// (same pattern as the app's parseObjectsData §5 check)
		// We write the snapshot regardless and let PR + red CI checks surface it.
		// -----------------------------------------------------------------------
		const mappingsFieldSet = new Set(schemaFieldOrder);
		const undocumented = museumFields.filter((f) => !mappingsFieldSet.has(f));

		if (undocumented.length > 0) {
			console.warn('\n⚠️  Warning: Museum has columns not described in Mappings:');
			for (const f of undocumented) {
				console.warn(`  ✗ ${f}`);
			}
			console.warn(
				'The app will throw a §5 error in production until this is resolved.\n' +
					'Either add these fields to the Mappings sheet, or remove them from Museum.\n' +
					'The snapshot has been written — red CI checks on the PR will flag this.',
			);
		} else {
			console.log('\nAll Museum columns are described in Mappings. ✓');
		}

		// Write Museum snapshot
		const museumContent = generateMuseumSnapshotFile(museumFields, timestamp);
		writeFileSync(MUSEUM_OUTPUT_PATH, museumContent, 'utf-8');
		console.log(`\nMuseum snapshot written to e2e/fixtures/museum.snapshot.ts`);
	}
}

// ---------------------------------------------------------------------------
// File generation
// ---------------------------------------------------------------------------

function generateSnapshotFile(data: SheetsApiResponse, timestamp: string): string {
	// Each row on its own line for readable diffs when values change
	const rowLines = data.values.map((row) => `\t\t${JSON.stringify(row)},`).join('\n');

	// Field names (data rows only, skip header)
	const fieldNames = data.values.slice(1).map((row) => row[0]);
	const fieldLines = fieldNames.map((f) => `\t${JSON.stringify(f)},`).join('\n');

	return (
		`// biome-ignore format: generated file — run \`npm run fixtures:update\` to refresh\n` +
		`// Auto-generated by scripts/capture-fixtures.ts\n` +
		`// Last captured: ${timestamp}\n` +
		`// Run \`npm run fixtures:update\` to replace with real Mappings data\n` +
		`\n` +
		`import type { SheetsApiResponse } from '../../src/types/metadata';\n` +
		`\n` +
		`export const CAPTURED_AT = '${timestamp}';\n` +
		`\n` +
		`/**\n` +
		` * Frozen snapshot of the real Mappings worksheet API response.\n` +
		` * Used as the mock response for all E2E and unit tests.\n` +
		` */\n` +
		`export const mappingsSnapshot: SheetsApiResponse = {\n` +
		`\trange: ${JSON.stringify(data.range)},\n` +
		`\tmajorDimension: ${JSON.stringify(data.majorDimension)},\n` +
		`\tvalues: [\n` +
		`${rowLines}\n` +
		`\t],\n` +
		`};\n` +
		`\n` +
		`/**\n` +
		` * Ordered tuple of all field names in schema order, as const.\n` +
		` * Provides literal types for SchemaField and SchemaRecord.\n` +
		` * Auto-generated by scripts/capture-fixtures.ts — do not edit manually.\n` +
		` */\n` +
		`export const SCHEMA_FIELDS = [\n` +
		`${fieldLines}\n` +
		`] as const;\n` +
		`\n` +
		`/** Union of all schema field name literals. */\n` +
		`export type SchemaField = (typeof SCHEMA_FIELDS)[number];\n` +
		`\n` +
		`/** A record with every schema field mapped to a string value. */\n` +
		`export type SchemaRecord = Record<SchemaField, string>;\n` +
		`\n` +
		`/**\n` +
		` * Field names extracted from the Mappings sheet, in schema order.\n` +
		` * This drives the factory: column order in Museum sheet rows must match this.\n` +
		` */\n` +
		`export const schemaFieldOrder: string[] = [...SCHEMA_FIELDS];\n`
	);
}

function generateMuseumSnapshotFile(fields: string[], timestamp: string): string {
	const fieldLines = fields.map((f) => `\t${JSON.stringify(f)},`).join('\n');

	return (
		`// biome-ignore format: generated file — run \`npm run fixtures:update\` to refresh\n` +
		`// Auto-generated by scripts/capture-fixtures.ts\n` +
		`// Last captured: ${timestamp}\n` +
		`// Run \`npm run fixtures:update\` to replace with real Museum header data\n` +
		`\n` +
		`export const MUSEUM_CAPTURED_AT = '${timestamp}';\n` +
		`\n` +
		`/**\n` +
		` * Ordered tuple of all Museum worksheet column headers in sheet order.\n` +
		` * Auto-generated by scripts/capture-fixtures.ts — do not edit manually.\n` +
		` */\n` +
		`export const MUSEUM_FIELDS = [\n` +
		`${fieldLines}\n` +
		`] as const;\n` +
		`\n` +
		`/** Union of all Museum column name literals. */\n` +
		`export type MuseumField = (typeof MUSEUM_FIELDS)[number];\n` +
		`\n` +
		`/**\n` +
		` * Museum column names in sheet order.\n` +
		` * Used as the header row in buildMuseumResponse().\n` +
		` */\n` +
		`export const museumFieldOrder: string[] = [...MUSEUM_FIELDS];\n`
	);
}

main();
