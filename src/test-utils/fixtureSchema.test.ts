/**
 * Schema contract test for the Mappings snapshot.
 *
 * This test will FAIL whenever:
 *   - a field is added to the Mappings sheet
 *   - a field is removed from the Mappings sheet
 *   - a field name is renamed
 *
 * When that happens:
 *   1. Run `npm run fixtures:update` to pull the new schema
 *   2. Run `npm test` — this test will show a clear diff of what changed
 *   3. Update the `expectedSchema` list below to match
 *   4. Update `src/constants/objectFields.ts` if any used field was renamed
 *   5. Update pre-baked objects in `e2e/fixtures/factory.ts` if needed
 *      (ObjectFields/SchemaRecord is now auto-derived — no manual interface update needed)
 */

import { schemaFieldOrder } from '../../e2e/fixtures/mappings.snapshot';
import { museumFieldOrder } from '../../e2e/fixtures/museum.snapshot';
import { OBJECT_FIELDS } from '../constants/objectFields';

const expectedSchema = [
	'moo:workingNotes',
	'moo:tags',
	'dcterms:Collection',
	'dcterms:identifier.moooi',
	'dcterms:identifier.moooiqr',
	'dcterms:dateAccepted',
	'dcterms:accrualMethod',
	'dcterms:source.acquisition',
	'dcterms:provenance',
	'dcterms:title',
	'dcterms:alternative',
	'dcterms:type',
	'dcterms:format',
	'dcterms:identifier.isbn',
	'dcterms:creator',
	'dcterms:creator.mooRef',
	'dcterms:creator.troveRef',
	'dcterms:creator.sroRef',
	'moo:relatedEntities',
	'moo:relatedEntities.mooRef',
	'moo:relatedEntities.troveRef',
	'moo:relatedEntities.sroRef',
	'dcterms:created',
	'dcterms:Jurisdiction',
	'dcterms:spatial',
	'dcterms:spatial.uri',
	'dcterms:temporal',
	'dcterms:publisher',
	'dcterms:dateCopyrighted',
	'dcterms:contributor.author',
	'dcterms:description',
	'dcterms:image',
	'dcterms:description.condition',
	'dcterms:Location',
	'dcterms:Location.qr',
	'dwc:higherGeography',
	'dwc:higherGeographyID',
	'dwc:eventDate',
	'dcterms:rights',
	'dcterms:rightsHolder',
	'dcterms:extent',
	'dcterms:tableOfContents',
];

describe('Mappings snapshot schema contract', () => {
	it('matches the expected field list (update expectedSchema if this fails after fixtures:update)', () => {
		expect(schemaFieldOrder).toEqual(expectedSchema);
	});

	it('contains no empty field names (run fixtures:update to refresh if this fails)', () => {
		const empties = schemaFieldOrder.filter((f) => !f.trim());
		expect(empties).toEqual([]);
	});

	it('includes all OBJECT_FIELDS constants (update objectFields.ts if a field was renamed)', () => {
		for (const [key, field] of Object.entries(OBJECT_FIELDS)) {
			expect(schemaFieldOrder, `OBJECT_FIELDS.${key} ("${field}") missing from schema`).toContain(field);
		}
	});
});

describe('Museum snapshot schema contract', () => {
	it('every Museum column is described in the Mappings schema (run fixtures:update if this fails)', () => {
		const schemaFieldSet = new Set(schemaFieldOrder);
		const undocumented = museumFieldOrder.filter((f) => !schemaFieldSet.has(f));
		expect(
			undocumented,
			`Museum has columns not in Mappings: ${undocumented.join(', ')}. ` +
				'Either add these fields to the Mappings sheet or remove them from Museum.',
		).toEqual([]);
	});
});
