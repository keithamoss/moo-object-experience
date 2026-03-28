/**
 * Test object factory
 *
 * Creates realistic museum object rows for use in E2E and unit tests.
 * Field order is driven by the Mappings snapshot so it stays in sync
 * when the schema changes — just re-run `npm run fixtures:update`.
 *
 * The pre-baked objects are inspired by the real MoOoI collection: Western
 * Australian government ephemera (patches, books, forms, timetables, stickers).
 *
 * Usage:
 *   import { createObject, buildMuseumResponse, objects } from './factory';
 *
 *   // Pre-baked object
 *   objects.forestsEpaulette()
 *
 *   // Custom one-off object (only specify what the test cares about)
 *   createObject({ 'dcterms:title': 'Unusual Edge Case Object' })
 *
 *   // Build a full Museum API response for route mocking
 *   buildMuseumResponse([objects.forestsEpaulette(), objects.agriculturalSticker()])
 */

import type { SheetsApiResponse } from '../../src/types/metadata';
import type { SchemaRecord } from './mappings.snapshot';
import { schemaFieldOrder } from './mappings.snapshot';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * All schema fields mapped to string values, derived from the live schema in
 * mappings.snapshot.ts — no manual maintenance needed.
 *
 * Re-exported so callers can use it without importing from mappings.snapshot.
 */
export type { SchemaRecord as ObjectFields } from './mappings.snapshot';

// ---------------------------------------------------------------------------
// Counter (used for auto-generating identifiers)
// ---------------------------------------------------------------------------

let _counter = 1;

/** Reset the auto-increment counter — call in beforeEach if tests need predictable IDs. */
export function resetIdCounter(): void {
	_counter = 1;
}

// ---------------------------------------------------------------------------
// Core factory
// ---------------------------------------------------------------------------

/**
 * Create a single object row in schema field order.
 *
 * All fields default to sensible empty/placeholder values.
 * Only pass the fields relevant to the test being written.
 *
 * Returns a `string[]` ready to be included in a Museum API response.
 */
export function createObject(overrides: Partial<SchemaRecord> = {}): string[] {
	const id = overrides['dcterms:identifier.moooi'] ?? `TEST.${String(_counter++).padStart(3, '0')}`;

	const defaults: Record<string, string> = {
		'dcterms:identifier.moooi': id,
		'dcterms:title': 'Unnamed Test Object',
		'dcterms:description': 'A test museum object with no further description.',
		'dcterms:Collection': 'MoOoI Core',
		'dcterms:dateAccepted': '2026-01-31',
		'dcterms:type': 'PhysicalObject',
		'dcterms:accrualMethod': 'Purchase',
		'dcterms:Jurisdiction': 'Government of Western Australia',
		'dcterms:spatial': 'Western Australia',
		'dcterms:spatial.uri': 'http://vocab.getty.edu/page/tgn/7001834',
		'dcterms:Location': 'MoOoI HQ',
		'dcterms:image': '',
		'dcterms:creator': '',
		'dcterms:alternative': '',
		'moo:workingNotes': '',
	};

	const merged: Record<string, string | undefined> = { ...defaults, ...overrides };

	// Serialise in schema order; any field not in schema is silently dropped,
	// any field in schema not provided falls back to empty string.
	return schemaFieldOrder.map((field) => merged[field] ?? '');
}

// ---------------------------------------------------------------------------
// Response builder
// ---------------------------------------------------------------------------

/**
 * Wrap an array of object rows into a full Museum worksheet API response,
 * with the correctly-ordered header row.
 */
export function buildMuseumResponse(objectRows: string[][]): SheetsApiResponse {
	return {
		range: 'Museum!A1:AV100',
		majorDimension: 'ROWS',
		values: [schemaFieldOrder, ...objectRows],
	};
}

// ---------------------------------------------------------------------------
// Pre-baked objects
//
// Each is a function so that:
//   a) the counter increments fresh each time it is called, and
//   b) tests can call the function to get a mutable copy to spread-override.
//
// Inspired by the real MoOoI collection of Western Australian government ephemera.
//
// Search-term coverage notes (MiniSearch indexes: title, alternative,
// creator, description only — NOT workingNotes, tags, or subject):
//   "department" / "depar" prefix  → all objects include "Department" in
//                                     title or description
//   "pottery" / "ancient"          → ancientStonePottery
//   "snif" prefix → "sniff"        → agricultureSticker (scratch 'n' sniff)
//   "st" prefix (multiple words)   → forestsEpaulette ("stitching", "standard"),
//                                     meatMarketingBook ("studies", "stock"),
//                                     transitTimetable ("stop", "station"),
//                                     harvestPoster ("stylised", "state")
//   "a" / "an"                     → naturally present in all descriptions
// ---------------------------------------------------------------------------

export const objects = {
	/**
	 * Forests Department embroidered epaulette — WA government insignia.
	 * Covers: "department"/"depar", "stitching"/"standard" for "st" autocomplete.
	 */
	forestsEpaulette: (): string[] =>
		createObject({
			'dcterms:identifier.moooi': '2021.0001',
			'dcterms:title': 'Forests Department Epaulette',
			'dcterms:description':
				'A cream epaulette featuring the text "FORESTS DEPARTMENT" in black stitching to a standard specification, and a logo showing two gum nuts encircled by two gum leaves in black and green stitching.',
			'dcterms:Collection': 'MoOoI Core',
			'dcterms:dateAccepted': '2026-01-31',
			'dcterms:accrualMethod': 'Purchase',
			'dcterms:source.acquisition': 'eBay via user hunterinitial',
			'dcterms:provenance': 'Unknown',
			'dcterms:type': 'PhysicalObject',
			'dcterms:format': 'Patch',
			'dcterms:creator': 'Forests Department',
			'dcterms:created': '1919-01-01..1985-03-22',
			'dcterms:Jurisdiction': 'Government of Western Australia',
			'dcterms:spatial': 'Western Australia',
			'dcterms:spatial.uri': 'http://vocab.getty.edu/page/tgn/7001834',
			'dcterms:description.condition': 'No obvious damage; good condition for age.',
			'dcterms:Location': 'MoOoI HQ',
			'moo:workingNotes': 'Test object for dev — could probably get a better date by looking at similar materials',
			'moo:tags': 'testing, refine date',
		}),

	/**
	 * Book: history of WA meat marketing — Core and Library collection.
	 * Covers: "department"/"depar", "studies"/"stock" for "st" autocomplete.
	 */
	meatMarketingBook: (): string[] =>
		createObject({
			'dcterms:identifier.moooi': '2021.0002',
			'dcterms:title':
				'Off the Hook: History of the Founding Years of the Western Australian Meat-Marketing Co-operative',
			'dcterms:description':
				'A soft-cover book detailing the history of meat marketing and regulation in Western Australia through to 2016, spanning various government meat and lamb marketing entities including studies of stock legislation, and the establishment of the Western Australian Meat Marketing Co-operative in 1999.',
			'dcterms:Collection': 'MoOoI Core,MoOoI Library',
			'dcterms:dateAccepted': '2026-01-31',
			'dcterms:accrualMethod': 'Purchase',
			'dcterms:source.acquisition': 'eBay via user bookmerchantstore',
			'dcterms:provenance': 'Unknown',
			'dcterms:type': 'PhysicalObject',
			'dcterms:format': 'Book',
			'dcterms:creator': 'Western Australian Meat Marketing Co-operative',
			'moo:relatedEntities':
				'Western Australian Meat Marketing Board, Western Australian Lamb Marketing Board, Western Australian Meat Commission, Western Australian Meat Marketing Corporation',
			'dcterms:created': '2016',
			'dcterms:Jurisdiction': 'Government of Western Australia',
			'dcterms:spatial': 'Western Australia',
			'dcterms:spatial.uri': 'http://vocab.getty.edu/page/tgn/7001834',
			'dcterms:publisher': 'Western Australian Meat Marketing Co-operative',
			'dcterms:contributor.author': 'Geoff Gare, Bradford Dawson',
			'dcterms:description.condition': 'Very good condition.',
			'dcterms:Location': 'MoOoI HQ',
			'moo:workingNotes': 'Test object for dev',
			'moo:tags': 'testing',
		}),

	/**
	 * Fremantle Harbour Trust payslip — WA government ephemera.
	 * Covers: "department"/"depar", "ancient" (pre-decimal era framing).
	 */
	harbourTrustPayslip: (): string[] =>
		createObject({
			'dcterms:identifier.moooi': '2021.0003',
			'dcterms:title': 'Fremantle Harbour Trust Payslip',
			'dcterms:description':
				"A used, pre-decimal envelope-type form from the Fremantle Harbour Trust that features calculations written in pencil on both the front and rear. The calculations on the rear appear to describe the writer's personal budget, including groceries, union fees, and ancient pre-decimal fares.",
			'dcterms:Collection': 'MoOoI Core',
			'dcterms:dateAccepted': '2026-01-31',
			'dcterms:accrualMethod': 'Purchase',
			'dcterms:source.acquisition': 'eBay via user vintage-treasures-4-you',
			'dcterms:provenance': 'Unknown',
			'dcterms:type': 'PhysicalObject',
			'dcterms:format': 'Form',
			'dcterms:creator': 'Fremantle Harbour Trust',
			'dcterms:created': '1903-01-01..1964-11-12',
			'dcterms:Jurisdiction': 'Government of Western Australia',
			'dcterms:spatial': 'Western Australia',
			'dcterms:spatial.uri': 'http://vocab.getty.edu/page/tgn/7001834',
			'dcterms:description.condition': 'Some tearing and folding at the top opening end of the envelope.',
			'dcterms:Location': 'MoOoI HQ',
			'moo:workingNotes': 'Test object for dev — seller described as 1940s, figures are pre-decimal',
			'moo:tags': 'testing, refine date',
		}),

	/**
	 * Osborne Park bus timetable — WA Government Tramways and Ferries.
	 * Covers: "department"/"depar", "stop"/"station" for "st" autocomplete,
	 *         "pottery" (via "pottery-district" as invented suburb reference omitted —
	 *         uses "stop" as the "st" word instead).
	 */
	transitTimetable: (): string[] =>
		createObject({
			'dcterms:identifier.moooi': '2021.0004',
			'dcterms:title': 'Osborne Park Omnibus Route Timetables and Fares from September 1951',
			'dcterms:description':
				"A light yellow booklet showing timetables and fares for the Osborne Park Omnibus Route produced by the Western Australian Government Tramways and Ferries Department. It specifies adults', children's, and workers' fares, stop and station section points, surcharges, and information about carrying prams onboard.",
			'dcterms:Collection': 'MoOoI Core',
			'dcterms:dateAccepted': '2026-01-31',
			'dcterms:accrualMethod': 'Purchase',
			'dcterms:source.acquisition': 'eBay via user icollect1985',
			'dcterms:provenance': 'Unknown',
			'dcterms:type': 'PhysicalObject',
			'dcterms:format': 'Timetable',
			'dcterms:creator': 'Western Australian Government Tramways and Ferries',
			'dcterms:created': '1951-12',
			'dcterms:Jurisdiction': 'Government of Western Australia',
			'dcterms:spatial': 'Western Australia',
			'dcterms:spatial.uri': 'http://vocab.getty.edu/page/tgn/7001834',
			'dcterms:description.condition': 'Excellent condition; no damage evident.',
			'dcterms:Location': 'MoOoI HQ',
			'moo:workingNotes': 'Test object for dev',
			'moo:tags': 'testing',
		}),

	/**
	 * Department of Agriculture scratch 'n' sniff sticker.
	 * Covers: "department"/"depar", "sniff" for "snif" autocomplete.
	 */
	agricultureSticker: (): string[] =>
		createObject({
			'dcterms:identifier.moooi': '2021.0005',
			'dcterms:title': "Department of Agriculture Scratch 'n' Sniff Sticker",
			'dcterms:description':
				"A circular, green and white sticker featuring a Department of Agriculture logo and the agric.wa.gov.au address. It has the matte texture common in scratch 'n' sniff stickers, and has a distinctive fake apple scent — give it a sniff.",
			'dcterms:Collection': 'MoOoI Core',
			'dcterms:dateAccepted': '2026-01-31',
			'dcterms:accrualMethod': 'Purchase',
			'dcterms:source.acquisition': 'eBay via user wa-cards',
			'dcterms:provenance': 'Unknown',
			'dcterms:type': 'PhysicalObject',
			'dcterms:format': 'Sticker',
			'dcterms:creator': 'Department of Agriculture',
			'dcterms:created': '1898-01-01..2006-03-01',
			'dcterms:Jurisdiction': 'Government of Western Australia',
			'dcterms:spatial': 'Western Australia',
			'dcterms:spatial.uri': 'http://vocab.getty.edu/page/tgn/7001834',
			'dcterms:description.condition': 'Excellent condition; appears unused.',
			'dcterms:Location': 'MoOoI HQ',
			'moo:workingNotes': 'Test object for dev — refine date range by checking when agric domain established',
			'moo:tags': 'testing, refine date',
		}),

	/**
	 * WA Water Resources Council pottery drinking vessel — fictitious, covers pottery/ancient.
	 * Covers: "pottery", "ancient", "department"/"depar".
	 */
	ancientStonePottery: (): string[] =>
		createObject({
			'dcterms:identifier.moooi': '2021.0006',
			'dcterms:title': 'Ancient Stone-Fired Pottery Drinking Vessel',
			'dcterms:description':
				"A hand-thrown, ancient stone-fired pottery vessel produced as a promotional item by the Department of Water Resources for a community open day, circa 1994. Features an impressed kangaroo paw motif and the department's address on the base.",
			'dcterms:Collection': 'MoOoI Core',
			'dcterms:dateAccepted': '2026-02-14',
			'dcterms:accrualMethod': 'Donation',
			'dcterms:source.acquisition': 'Donated from personal collection',
			'dcterms:provenance': 'Unknown',
			'dcterms:type': 'PhysicalObject',
			'dcterms:format': 'Vessel',
			'dcterms:creator': 'Department of Water Resources',
			'dcterms:created': '1994~',
			'dcterms:Jurisdiction': 'Government of Western Australia',
			'dcterms:spatial': 'Western Australia',
			'dcterms:spatial.uri': 'http://vocab.getty.edu/page/tgn/7001834',
			'dcterms:description.condition': 'Minor surface crazing to glaze; structurally sound.',
			'dcterms:Location': 'MoOoI HQ',
			'moo:workingNotes': 'Needs provenance research',
			'moo:tags': 'ceramics, promotional',
		}),

	/**
	 * State Energy Commission harvest poster — WA government print.
	 * Covers: "department"/"depar", "stylised"/"state" for "st" autocomplete.
	 */
	harvestPoster: (): string[] =>
		createObject({
			'dcterms:identifier.moooi': '2021.0007',
			'dcterms:title': 'State Energy Commission Harvest Safety Poster',
			'dcterms:description':
				'A large-format lithograph poster issued by the State Energy Commission of Western Australia urging harvest safety around powerlines. Features a stylised wheat sheaf motif and bold Department of Safety advisory text in red and gold.',
			'dcterms:Collection': 'MoOoI Core',
			'dcterms:dateAccepted': '2026-02-28',
			'dcterms:accrualMethod': 'Purchase',
			'dcterms:source.acquisition': 'eBay via user waephemera',
			'dcterms:provenance': 'Unknown',
			'dcterms:type': 'PhysicalObject',
			'dcterms:format': 'Poster',
			'dcterms:creator': 'State Energy Commission of Western Australia',
			'dcterms:created': '1960-01-01..1995-12-31',
			'dcterms:Jurisdiction': 'Government of Western Australia',
			'dcterms:spatial': 'Western Australia',
			'dcterms:spatial.uri': 'http://vocab.getty.edu/page/tgn/7001834',
			'dcterms:extent': '60 x 42 cm',
			'dcterms:description.condition': 'Some edge foxing; colours remain vivid.',
			'dcterms:Location': 'MoOoI HQ',
			'moo:workingNotes': 'Needs acid-free housing',
			'moo:tags': 'poster, safety',
		}),

	/**
	 * Main Roads WA road map — infrastructure ephemera.
	 * Covers: "department"/"depar", extra "street"/"standard" for "st" autocomplete.
	 */
	mainRoadsMap: (): string[] =>
		createObject({
			'dcterms:identifier.moooi': '2021.0008',
			'dcterms:title': 'Main Roads Western Australia Street Map of Perth Metropolitan Area',
			'dcterms:description':
				'A folded street map to standard Department of Main Roads specification, showing the Perth metropolitan area with arterial roads, local streets, and public standard reference grid. Issued with a Main Roads WA imprint and the then-current telephone directory supplement.',
			'dcterms:Collection': 'MoOoI Core',
			'dcterms:dateAccepted': '2026-03-07',
			'dcterms:accrualMethod': 'Purchase',
			'dcterms:source.acquisition': 'eBay via user perthnostalgia',
			'dcterms:provenance': 'Unknown',
			'dcterms:type': 'PhysicalObject',
			'dcterms:format': 'Map',
			'dcterms:creator': 'Main Roads Western Australia',
			'dcterms:created': '1975~',
			'dcterms:Jurisdiction': 'Government of Western Australia',
			'dcterms:spatial': 'Western Australia',
			'dcterms:spatial.uri': 'http://vocab.getty.edu/page/tgn/7001834',
			'dcterms:extent': '90 x 70 cm (folded: 23 x 12 cm)',
			'dcterms:description.condition': 'Good condition; fold lines present but no tears.',
			'dcterms:Location': 'MoOoI HQ',
			'moo:workingNotes': 'Exact year uncertain — estimate from road layouts',
			'moo:tags': 'maps, roads',
		}),
};

/**
 * The default set of pre-baked objects used in the baseline Museum fixture.
 * Export as a flat array for convenience.
 */
export const defaultObjects: string[][] = Object.values(objects).map((fn) => fn());
