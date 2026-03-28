import { describe, expect, it } from 'vitest';
import { OBJECT_FIELDS } from '../src/constants/objectFields';
import { findMissingObjectFields, findUndocumentedMuseumFields } from './capture-fixtures';

describe('capture-fixtures validation helpers', () => {
	describe('findMissingObjectFields', () => {
		it('returns an empty array when all OBJECT_FIELDS are present', () => {
			const schemaFields = Object.values(OBJECT_FIELDS);
			expect(findMissingObjectFields(schemaFields)).toEqual([]);
		});

		it('returns missing OBJECT_FIELDS when one or more are absent', () => {
			const schemaFields = Object.values(OBJECT_FIELDS).filter((f) => f !== OBJECT_FIELDS.DESCRIPTION);
			expect(findMissingObjectFields(schemaFields)).toEqual([OBJECT_FIELDS.DESCRIPTION]);
		});
	});

	describe('findUndocumentedMuseumFields', () => {
		it('returns an empty array when Museum fields are all in schema', () => {
			const schemaFields = ['dcterms:identifier.moooi', 'dcterms:title', 'dcterms:description'];
			const museumFields = ['dcterms:identifier.moooi', 'dcterms:title'];
			expect(findUndocumentedMuseumFields(museumFields, schemaFields)).toEqual([]);
		});

		it('returns Museum fields that are missing from schema', () => {
			const schemaFields = ['dcterms:identifier.moooi', 'dcterms:title'];
			const museumFields = ['dcterms:identifier.moooi', 'dcterms:title', 'test:undocumentedA', 'test:undocumentedB'];
			expect(findUndocumentedMuseumFields(museumFields, schemaFields)).toEqual([
				'test:undocumentedA',
				'test:undocumentedB',
			]);
		});
	});
});
