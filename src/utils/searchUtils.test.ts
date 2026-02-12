import { describe, expect, it } from 'vitest';
import { ALL_SEARCHABLE_FIELD_NAMES, SearchableFieldName } from '../config/searchConfig';
import { areAllFieldsSelected, areFieldArraysEqual, parseFieldsFromURL } from './searchUtils';

describe('parseFieldsFromURL', () => {
	it('should return all fields when param is null (no URL param)', () => {
		const result = parseFieldsFromURL(null);
		expect(result).toEqual(ALL_SEARCHABLE_FIELD_NAMES);
	});

	it('should return empty array when param is empty string (explicitly deselected all)', () => {
		const result = parseFieldsFromURL('');
		expect(result).toEqual([]);
	});

	it('should parse valid comma-separated fields', () => {
		const result = parseFieldsFromURL('dcterms:title,dcterms:description');
		expect(result).toEqual(['dcterms:title', 'dcterms:description']);
	});

	it('should filter out invalid field names', () => {
		const result = parseFieldsFromURL('dcterms:title,invalid,dcterms:description,fake');
		expect(result).toEqual(['dcterms:title', 'dcterms:description']);
	});

	it('should handle single field', () => {
		const result = parseFieldsFromURL('dcterms:title');
		expect(result).toEqual(['dcterms:title']);
	});
});

describe('areFieldArraysEqual', () => {
	it('should return true for identical arrays', () => {
		const fields1: SearchableFieldName[] = ['dcterms:title', 'dcterms:description'];
		const fields2: SearchableFieldName[] = ['dcterms:title', 'dcterms:description'];
		expect(areFieldArraysEqual(fields1, fields2)).toBe(true);
	});

	it('should return false for arrays with different lengths', () => {
		const fields1: SearchableFieldName[] = ['dcterms:title', 'dcterms:description'];
		const fields2: SearchableFieldName[] = ['dcterms:title'];
		expect(areFieldArraysEqual(fields1, fields2)).toBe(false);
	});

	it('should return false for arrays with different order', () => {
		const fields1: SearchableFieldName[] = ['dcterms:title', 'dcterms:description'];
		const fields2: SearchableFieldName[] = ['dcterms:description', 'dcterms:title'];
		expect(areFieldArraysEqual(fields1, fields2)).toBe(false);
	});

	it('should return true for empty arrays', () => {
		expect(areFieldArraysEqual([], [])).toBe(true);
	});
});

describe('areAllFieldsSelected', () => {
	it('should return true when all fields are selected', () => {
		expect(areAllFieldsSelected(ALL_SEARCHABLE_FIELD_NAMES)).toBe(true);
	});

	it('should return false when only some fields are selected', () => {
		expect(areAllFieldsSelected(['dcterms:title', 'dcterms:description'])).toBe(false);
	});

	it('should return false when no fields are selected', () => {
		expect(areAllFieldsSelected([])).toBe(false);
	});

	it('should return false when extra invalid fields are included', () => {
		const fields = [...ALL_SEARCHABLE_FIELD_NAMES, 'invalid' as SearchableFieldName];
		expect(areAllFieldsSelected(fields)).toBe(false);
	});
});
