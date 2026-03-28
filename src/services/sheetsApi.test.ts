/**
 * Tests for sheetsApi.ts
 */

import { describe, expect, it } from 'vitest';
import { OBJECT_FIELDS, toFieldKey } from '../constants/objectFields';
import type { MetadataSchema } from '../types/metadata';
import { parseMetadataSchema, parseObjectsData } from './sheetsApi';

describe('sheetsApi', () => {
	describe('parseMetadataSchema', () => {
		describe('column header validation (existing)', () => {
			it('should throw error when Mappings sheet has no data rows', () => {
				const rows = [
					['Field', 'Namespace', 'Label', 'Applicable Collections', 'Required', 'Purpose', 'Field Type', 'Example'],
				];

				expect(() => parseMetadataSchema(rows)).toThrow(
					'Mappings sheet must have at least a header row and one data row',
				);
			});

			it('should throw error when required column headers are missing', () => {
				const rows = [
					['Field', 'Namespace'], // Missing most headers
					['dcterms:title', 'dcterms'],
				];

				expect(() => parseMetadataSchema(rows)).toThrow(/Mappings sheet is missing required columns/);
			});

			it('should parse metadata schema successfully with valid data', () => {
				const rows = [
					['Field', 'Namespace', 'Label', 'Applicable Collections', 'Required', 'Purpose', 'Field Type', 'Example'],
					['dcterms:identifier.moooi', 'dcterms', 'Identifier', 'All', 'TRUE', 'Unique ID', 'Text', 'OBJ-001'],
					['dcterms:title', 'dcterms', 'Title', 'All', 'TRUE', 'Object name', 'Text', 'Stone Axe'],
					[
						'dcterms:description',
						'dcterms',
						'Description',
						'All',
						'FALSE',
						'Object description',
						'Text',
						'Ancient tool',
					],
					['dcterms:creator', 'dcterms', 'Creator', 'All', 'FALSE', 'Creator name', 'Text', 'Unknown'],
					['dcterms:alternative', 'dcterms', 'Alternative', 'All', 'FALSE', 'Alt title', 'Text', ''],
					['dcterms:dateAccepted', 'dcterms', 'Date Accepted', 'All', 'FALSE', 'Accession date', 'Date', '2020-01-01'],
					['dcterms:format', 'dcterms', 'Format', 'All', 'FALSE', 'Physical format', 'Text', 'Stone'],
				];

				const schema = parseMetadataSchema(rows);

				expect(schema).toHaveLength(7);
				expect(schema[0].field).toBe('dcterms:identifier.moooi');
				expect(schema[0].label).toBe('Identifier');
				expect(schema[1].field).toBe('dcterms:title');
				expect(schema[2].field).toBe('dcterms:description');
			});
		});

		describe('§1 — OBJECT_FIELDS field-name validation (SHEETSAPI_IMPROVEMENTS.md)', () => {
			/**
			 * These tests verify that critical field names from OBJECT_FIELDS are present in the schema.
			 */

			it('should throw error when critical field dcterms:identifier.moooi is missing from Mappings', () => {
				const rows = [
					['Field', 'Namespace', 'Label', 'Applicable Collections', 'Required', 'Purpose', 'Field Type', 'Example'],
					// Missing dcterms:identifier.moooi - renamed or deleted
					['dcterms:title', 'dcterms', 'Title', 'All', 'TRUE', 'Object name', 'Text', 'Stone Axe'],
					[
						'dcterms:description',
						'dcterms',
						'Description',
						'All',
						'FALSE',
						'Object description',
						'Text',
						'Ancient tool',
					],
				];

				expect(() => parseMetadataSchema(rows)).toThrow(
					/Mappings sheet is missing critical application fields.*dcterms:identifier\.moooi/,
				);
			});

			it('should throw error when critical field dcterms:title is missing from Mappings', () => {
				const rows = [
					['Field', 'Namespace', 'Label', 'Applicable Collections', 'Required', 'Purpose', 'Field Type', 'Example'],
					['dcterms:identifier.moooi', 'dcterms', 'Identifier', 'All', 'TRUE', 'Unique ID', 'Text', 'OBJ-001'],
					// Missing dcterms:title
					[
						'dcterms:description',
						'dcterms',
						'Description',
						'All',
						'FALSE',
						'Object description',
						'Text',
						'Ancient tool',
					],
				];

				expect(() => parseMetadataSchema(rows)).toThrow(
					/Mappings sheet is missing critical application fields.*dcterms:title/,
				);
			});

			it('should throw error when multiple critical fields are missing', () => {
				const rows = [
					['Field', 'Namespace', 'Label', 'Applicable Collections', 'Required', 'Purpose', 'Field Type', 'Example'],
					// Only has identifier, missing title, description, creator, alternative, dateAccepted, format
					['dcterms:identifier.moooi', 'dcterms', 'Identifier', 'All', 'TRUE', 'Unique ID', 'Text', 'OBJ-001'],
					['dcterms:collection', 'dcterms', 'Collection', 'All', 'FALSE', 'Collection name', 'Text', 'Main'],
				];

				expect(() => parseMetadataSchema(rows)).toThrow(/Mappings sheet is missing critical application fields/);
			});

			it('should throw error when critical field is renamed', () => {
				const rows = [
					['Field', 'Namespace', 'Label', 'Applicable Collections', 'Required', 'Purpose', 'Field Type', 'Example'],
					['dcterms:identifier.moooi', 'dcterms', 'Identifier', 'All', 'TRUE', 'Unique ID', 'Text', 'OBJ-001'],
					['dcterms:titleText', 'dcterms', 'Title', 'All', 'TRUE', 'Object name', 'Text', 'Stone Axe'], // Renamed from dcterms:title
					[
						'dcterms:description',
						'dcterms',
						'Description',
						'All',
						'FALSE',
						'Object description',
						'Text',
						'Ancient tool',
					],
				];

				// Should fail because dcterms:title is missing (even though dcterms:titleText exists)
				expect(() => parseMetadataSchema(rows)).toThrow(
					/Mappings sheet is missing critical application fields.*dcterms:title/,
				);
			});

			it('should NOT throw error for non-critical fields missing from Mappings', () => {
				const rows = [
					['Field', 'Namespace', 'Label', 'Applicable Collections', 'Required', 'Purpose', 'Field Type', 'Example'],
					// All OBJECT_FIELDS present
					['dcterms:identifier.moooi', 'dcterms', 'Identifier', 'All', 'TRUE', 'Unique ID', 'Text', 'OBJ-001'],
					['dcterms:title', 'dcterms', 'Title', 'All', 'TRUE', 'Object name', 'Text', 'Stone Axe'],
					[
						'dcterms:description',
						'dcterms',
						'Description',
						'All',
						'FALSE',
						'Object description',
						'Text',
						'Ancient tool',
					],
					['dcterms:creator', 'dcterms', 'Creator', 'All', 'FALSE', 'Creator name', 'Text', 'Unknown'],
					['dcterms:alternative', 'dcterms', 'Alternative', 'All', 'FALSE', 'Alt title', 'Text', ''],
					['dcterms:dateAccepted', 'dcterms', 'Date Accepted', 'All', 'FALSE', 'Accession date', 'Date', '2020-01-01'],
					['dcterms:format', 'dcterms', 'Format', 'All', 'FALSE', 'Physical format', 'Text', 'Stone'],
					// Non-critical fields missing (e.g., dcterms:collection, dcterms:image, dcterms:date) - should be fine
				];

				// Should NOT throw - display-only fields are resilient to schema changes
				expect(() => parseMetadataSchema(rows)).not.toThrow();
			});

			it('should succeed when all OBJECT_FIELDS are present even with extra fields', () => {
				const rows = [
					['Field', 'Namespace', 'Label', 'Applicable Collections', 'Required', 'Purpose', 'Field Type', 'Example'],
					['dcterms:identifier.moooi', 'dcterms', 'Identifier', 'All', 'TRUE', 'Unique ID', 'Text', 'OBJ-001'],
					['dcterms:title', 'dcterms', 'Title', 'All', 'TRUE', 'Object name', 'Text', 'Stone Axe'],
					[
						'dcterms:description',
						'dcterms',
						'Description',
						'All',
						'FALSE',
						'Object description',
						'Text',
						'Ancient tool',
					],
					['dcterms:creator', 'dcterms', 'Creator', 'All', 'FALSE', 'Creator name', 'Text', 'Unknown'],
					['dcterms:alternative', 'dcterms', 'Alternative', 'All', 'FALSE', 'Alt title', 'Text', ''],
					['dcterms:dateAccepted', 'dcterms', 'Date Accepted', 'All', 'FALSE', 'Accession date', 'Date', '2020-01-01'],
					['dcterms:format', 'dcterms', 'Format', 'All', 'FALSE', 'Physical format', 'Text', 'Stone'],
					['dcterms:collection', 'dcterms', 'Collection', 'All', 'FALSE', 'Collection name', 'Text', 'Main'],
					['dcterms:image', 'dcterms', 'Image', 'All', 'FALSE', 'Image URL', 'Image', 'http://example.com/img.jpg'],
				];

				const schema = parseMetadataSchema(rows);
				expect(schema.length).toBeGreaterThanOrEqual(7); // At least all OBJECT_FIELDS
			});
		});
	});

	describe('parseObjectsData', () => {
		const validSchema: MetadataSchema = [
			{
				field: toFieldKey('dcterms:identifier.moooi'),
				namespace: 'dcterms',
				label: 'Identifier',
				applicableCollections: 'All',
				required: 'TRUE',
				purpose: 'Unique ID',
				fieldTypeAndControls: 'Text',
				example: 'OBJ-001',
			},
			{
				field: toFieldKey('dcterms:title'),
				namespace: 'dcterms',
				label: 'Title',
				applicableCollections: 'All',
				required: 'TRUE',
				purpose: 'Object name',
				fieldTypeAndControls: 'Text',
				example: 'Stone Axe',
			},
			{
				field: toFieldKey('dcterms:description'),
				namespace: 'dcterms',
				label: 'Description',
				applicableCollections: 'All',
				required: 'FALSE',
				purpose: 'Object description',
				fieldTypeAndControls: 'Text',
				example: 'Ancient tool',
			},
		];

		describe('basic parsing (existing)', () => {
			it('should throw error when Museum sheet has no data rows', () => {
				const rows = [['dcterms:identifier.moooi', 'dcterms:title', 'dcterms:description']];

				expect(() => parseObjectsData(rows, validSchema)).toThrow(
					'Museum sheet must have at least a header row and one data row',
				);
			});

			it('should parse objects successfully with valid data', () => {
				const rows = [
					['dcterms:identifier.moooi', 'dcterms:title', 'dcterms:description'],
					['OBJ-001', 'Stone Axe', 'Ancient stone cutting tool'],
					['OBJ-002', 'Wooden Spear', 'Traditional hunting weapon'],
				];

				const objects = parseObjectsData(rows, validSchema);

				expect(objects).toHaveLength(2);
				expect(objects[0][OBJECT_FIELDS.IDENTIFIER]).toBe('OBJ-001');
				expect(objects[0][OBJECT_FIELDS.TITLE]).toBe('Stone Axe');
				expect(objects[1][OBJECT_FIELDS.IDENTIFIER]).toBe('OBJ-002');
			});

			it('should filter out rows with empty identifiers', () => {
				const rows = [
					['dcterms:identifier.moooi', 'dcterms:title', 'dcterms:description'],
					['OBJ-001', 'Stone Axe', 'Ancient stone cutting tool'],
					['', 'Template Row', 'This should be filtered'], // Empty identifier
					['OBJ-002', 'Wooden Spear', 'Traditional hunting weapon'],
				];

				const objects = parseObjectsData(rows, validSchema);

				expect(objects).toHaveLength(2);
				expect(objects.map((o) => o[OBJECT_FIELDS.IDENTIFIER])).toEqual(['OBJ-001', 'OBJ-002']);
			});
		});

		describe('§3 — Missing identifier column guard (SHEETSAPI_IMPROVEMENTS.md)', () => {
			/**
			 * These tests verify that parseObjectsData throws an explicit error when the identifier
			 * column is missing from the Museum sheet header, rather than silently returning an empty array.
			 */

			it('should throw error when identifier field is missing from Museum sheet header', () => {
				const rows = [
					['dcterms:title', 'dcterms:description'], // Missing dcterms:identifier.moooi
					['Stone Axe', 'Ancient stone cutting tool'],
					['Wooden Spear', 'Traditional hunting weapon'],
				];

				expect(() => parseObjectsData(rows, validSchema)).toThrow(
					/Museum sheet header row is missing required field "dcterms:identifier\.moooi"/,
				);
			});

			it('should throw error when identifier column name is misspelled', () => {
				const rows = [
					['dcterms:identifer.moooi', 'dcterms:title'], // Misspelled identifier
					['OBJ-001', 'Stone Axe'],
				];

				expect(() => parseObjectsData(rows, validSchema)).toThrow(
					/Museum sheet header row is missing required field "dcterms:identifier\.moooi"/,
				);
			});

			it('should throw error when all column headers are missing', () => {
				const rows = [
					[], // Empty header row
					['OBJ-001', 'Stone Axe', 'Ancient tool'],
				];

				expect(() => parseObjectsData(rows, validSchema)).toThrow(
					/Museum sheet header row is missing required field "dcterms:identifier\.moooi"/,
				);
			});
		});

		describe('§2 — Duplicate identifier detection (SHEETSAPI_IMPROVEMENTS.md)', () => {
			/**
			 * These tests verify that parseObjectsData detects and reports duplicate identifiers.
			 */

			it('should throw error when duplicate identifiers exist', () => {
				const rows = [
					['dcterms:identifier.moooi', 'dcterms:title', 'dcterms:description'],
					['OBJ-001', 'Stone Axe', 'Ancient stone cutting tool'],
					['OBJ-002', 'Wooden Spear', 'Traditional hunting weapon'],
					['OBJ-001', 'Metal Tool', 'Duplicate identifier'], // Duplicate OBJ-001
				];

				expect(() => parseObjectsData(rows, validSchema)).toThrow(
					/Museum sheet contains duplicate object identifiers: OBJ-001/,
				);
			});

			it('should throw error listing all duplicate identifiers', () => {
				const rows = [
					['dcterms:identifier.moooi', 'dcterms:title', 'dcterms:description'],
					['OBJ-001', 'Stone Axe', 'First occurrence'],
					['OBJ-002', 'Wooden Spear', 'First occurrence'],
					['OBJ-001', 'Metal Tool', 'Duplicate OBJ-001'],
					['OBJ-003', 'Basket', 'Unique'],
					['OBJ-002', 'Ceramic Pot', 'Duplicate OBJ-002'],
				];

				expect(() => parseObjectsData(rows, validSchema)).toThrow(
					/Museum sheet contains duplicate object identifiers.*OBJ-001.*OBJ-002/,
				);
			});

			it('should throw error when identifier appears three times', () => {
				const rows = [
					['dcterms:identifier.moooi', 'dcterms:title', 'dcterms:description'],
					['OBJ-001', 'Stone Axe', 'First'],
					['OBJ-001', 'Metal Tool', 'Second duplicate'],
					['OBJ-001', 'Wooden Tool', 'Third duplicate'],
				];

				// Should report OBJ-001 twice (for the second and third occurrences)
				expect(() => parseObjectsData(rows, validSchema)).toThrow(
					/Museum sheet contains duplicate object identifiers.*OBJ-001/,
				);
			});

			it('should NOT throw error when all identifiers are unique', () => {
				const rows = [
					['dcterms:identifier.moooi', 'dcterms:title', 'dcterms:description'],
					['OBJ-001', 'Stone Axe', 'Ancient stone cutting tool'],
					['OBJ-002', 'Wooden Spear', 'Traditional hunting weapon'],
					['OBJ-003', 'Metal Tool', 'Modern implement'],
				];

				expect(() => parseObjectsData(rows, validSchema)).not.toThrow();
			});
		});

		describe('integration with §1 defence-in-depth', () => {
			/**
			 * These tests verify the interaction between §1 and §3.
			 * §1 guarantees OBJECT_FIELDS.IDENTIFIER exists in the schema.
			 * §3 checks if that field exists in the Museum header.
			 */

			it('should throw explicit error when Museum header differs from schema', () => {
				const rows = [
					['dcterms:title', 'dcterms:description'], // Missing identifier
					['Stone Axe', 'Ancient tool'],
				];

				// With §3 implemented, this now throws an explicit error
				expect(() => parseObjectsData(rows, validSchema)).toThrow(
					/Museum sheet header row is missing required field "dcterms:identifier\.moooi"/,
				);
			});
		});

		describe('§4 — Museum missing critical OBJECT_FIELDS columns', () => {
			/**
			 * All OBJECT_FIELDS (the 7 critical application fields) must be present as Museum
			 * columns. Non-critical Mappings fields (e.g. dwc.higherGeography) may legitimately
			 * be absent from the Museum sheet and do not trigger this check.
			 */

			it('should throw when Museum is missing a critical OBJECT_FIELDS column', () => {
				const rows = [
					// Missing dcterms:description (an OBJECT_FIELDS field)
					['dcterms:identifier.moooi', 'dcterms:title'],
					['OBJ-001', 'Stone Axe'],
				];

				expect(() => parseObjectsData(rows, validSchema)).toThrow(
					/Museum sheet is missing critical columns.*dcterms:description/,
				);
			});

			it('should throw listing all missing critical columns when multiple are absent', () => {
				const rows = [
					// Only identifier present; title and description (both OBJECT_FIELDS) missing
					['dcterms:identifier.moooi'],
					['OBJ-001'],
				];

				expect(() => parseObjectsData(rows, validSchema)).toThrow(/Museum sheet is missing critical columns/);
			});

			it('should pass when Museum has all OBJECT_FIELDS even if non-critical Mappings fields are absent', () => {
				// Simulates: dwc.higherGeography is in Mappings but not a Museum column — that's fine
				const schemaWithExtra = [
					...validSchema,
					{
						field: toFieldKey('dwc.higherGeography'),
						namespace: 'Darwin Core',
						label: 'Higher geography',
						applicableCollections: 'Natural History',
						required: 'Optional',
						purpose: 'Geographic classification',
						fieldTypeAndControls: 'Free text',
						example: 'Australia',
					},
				];
				const rows = [
					// Museum has all OBJECT_FIELDS but NOT dwc.higherGeography
					['dcterms:identifier.moooi', 'dcterms:title', 'dcterms:description'],
					['OBJ-001', 'Stone Axe', 'Ancient tool'],
				];

				expect(() => parseObjectsData(rows, schemaWithExtra)).not.toThrow();
			});
		});

		describe('§5 — Museum has undocumented columns not in Mappings', () => {
			/**
			 * Every column in the Museum sheet must be described in Mappings.
			 * An undocumented column would be stored in ObjectData but never displayed
			 * (the detail page iterates schema fields, not object keys).
			 * §5 turns that silent, invisible data into a loud, actionable error.
			 */

			it('should throw when Museum has one column not in Mappings', () => {
				const rows = [
					['dcterms:identifier.moooi', 'dcterms:title', 'dcterms:description', 'dcterms:undocumented'],
					['OBJ-001', 'Stone Axe', 'Ancient tool', 'mystery value'],
				];

				expect(() => parseObjectsData(rows, validSchema)).toThrow(
					/Museum sheet has columns not described in Mappings.*dcterms:undocumented/,
				);
			});

			it('should throw listing all undocumented columns when multiple are present', () => {
				const rows = [
					['dcterms:identifier.moooi', 'dcterms:title', 'dcterms:description', 'dcterms:ghost', 'dcterms:phantom'],
					['OBJ-001', 'Stone Axe', 'Ancient tool', 'val1', 'val2'],
				];

				expect(() => parseObjectsData(rows, validSchema)).toThrow(/Museum sheet has columns not described in Mappings/);
			});

			it('should pass when Museum has exactly the same fields as Mappings', () => {
				const rows = [
					['dcterms:identifier.moooi', 'dcterms:title', 'dcterms:description'],
					['OBJ-001', 'Stone Axe', 'Ancient tool'],
				];

				expect(() => parseObjectsData(rows, validSchema)).not.toThrow();
			});

			it('should include the undocumented field name in the error for a rename scenario', () => {
				// Simulates: Museum added cterms:jurisdiction as a new column, but it was never
				// added to Mappings. The existing schema fields are all still present in Museum —
				// so §4 passes — but §5 fires because cterms:jurisdiction is undocumented.
				const rows = [
					[
						'dcterms:identifier.moooi',
						'dcterms:title',
						'dcterms:description',
						'cterms:jurisdiction', // New column added to Museum but not to Mappings
					],
					['OBJ-001', 'Stone Axe', 'Ancient tool', 'Government of Western Australia'],
				];

				// validSchema has exactly identifier, title, description — all present above → §4 passes
				// cterms:jurisdiction is not in validSchema → §5 fires
				expect(() => parseObjectsData(rows, validSchema)).toThrow(
					/Museum sheet has columns not described in Mappings.*cterms:jurisdiction/,
				);
			});
		});
	});
});
