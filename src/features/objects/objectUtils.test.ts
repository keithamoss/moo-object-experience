import { describe, expect, it } from 'vitest';
import { OBJECT_FIELDS } from '../../constants/objectFields';
import { type ObjectData, ParsedMetadataSchema } from '../../types/metadata';
import { getFieldsToDisplay } from './objectUtils';

describe('objectUtils', () => {
	describe('getFieldsToDisplay', () => {
		it('should return empty array when parsed schema is null', () => {
			const object: ObjectData = {};
			const result = getFieldsToDisplay(null, object);

			expect(result).toEqual([]);
		});

		it('should exclude title field', () => {
			const mockSchema = new ParsedMetadataSchema([
				{
					field: OBJECT_FIELDS.TITLE,
					label: 'Title',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Mandatory',
					purpose: 'Object title',
					fieldTypeAndControls: 'Free text',
					example: 'Example Title',
				},
				{
					field: OBJECT_FIELDS.DESCRIPTION,
					label: 'Description',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Mandatory',
					purpose: 'Object description',
					fieldTypeAndControls: 'Free text',
					example: 'Example Description',
				},
			]);
			const object: ObjectData = {
				[OBJECT_FIELDS.TITLE]: 'Test Title',
				[OBJECT_FIELDS.DESCRIPTION]: 'Test Description',
			};

			const result = getFieldsToDisplay(mockSchema, object);

			expect(result.some((f) => f.field === OBJECT_FIELDS.TITLE)).toBe(false);
		});

		it('should exclude identifier field', () => {
			const mockSchema = new ParsedMetadataSchema([
				{
					field: OBJECT_FIELDS.IDENTIFIER,
					label: 'Identifier',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Mandatory',
					purpose: 'Object identifier',
					fieldTypeAndControls: 'Free text',
					example: '12345',
				},
				{
					field: 'dcterms:creator',
					label: 'Creator',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Creator name',
					fieldTypeAndControls: 'Free text',
					example: 'John Doe',
				},
			]);
			const object: ObjectData = {
				[OBJECT_FIELDS.IDENTIFIER]: 'OBJ-001',
				'dcterms:creator': 'Test Creator',
			};

			const result = getFieldsToDisplay(mockSchema, object);

			expect(result.some((f) => f.field === OBJECT_FIELDS.IDENTIFIER)).toBe(false);
		});

		it('should exclude description field', () => {
			const mockSchema = new ParsedMetadataSchema([
				{
					field: OBJECT_FIELDS.DESCRIPTION,
					label: 'Description',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Mandatory',
					purpose: 'Object description',
					fieldTypeAndControls: 'Free text',
					example: 'Example Description',
				},
				{
					field: 'dcterms:creator',
					label: 'Creator',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Creator name',
					fieldTypeAndControls: 'Free text',
					example: 'John Doe',
				},
			]);
			const object: ObjectData = {
				[OBJECT_FIELDS.DESCRIPTION]: 'Test Description',
				'dcterms:creator': 'Test Creator',
			};

			const result = getFieldsToDisplay(mockSchema, object);

			expect(result.some((f) => f.field === OBJECT_FIELDS.DESCRIPTION)).toBe(false);
		});

		it('should exclude fields with empty values', () => {
			const mockSchema = new ParsedMetadataSchema([
				{
					field: 'dcterms:creator',
					label: 'Creator',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Creator name',
					fieldTypeAndControls: 'Free text',
					example: 'John Doe',
				},
				{
					field: 'dcterms:date',
					label: 'Date',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Date',
					fieldTypeAndControls: 'ISO8601 compliant date',
					example: '2024-01-01',
				},
			]);
			const object: ObjectData = {
				'dcterms:creator': 'Test Creator',
				'dcterms:date': '',
			};

			const result = getFieldsToDisplay(mockSchema, object);

			expect(result.length).toBe(1);
			expect(result[0].field).toBe('dcterms:creator');
		});

		it('should exclude fields with whitespace-only values', () => {
			const mockSchema = new ParsedMetadataSchema([
				{
					field: 'dcterms:creator',
					label: 'Creator',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Creator name',
					fieldTypeAndControls: 'Free text',
					example: 'John Doe',
				},
				{
					field: 'dcterms:date',
					label: 'Date',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Date',
					fieldTypeAndControls: 'ISO8601 compliant date',
					example: '2024-01-01',
				},
			]);
			const object: ObjectData = {
				'dcterms:creator': 'Test Creator',
				'dcterms:date': '   ',
			};

			const result = getFieldsToDisplay(mockSchema, object);

			expect(result.length).toBe(1);
			expect(result[0].field).toBe('dcterms:creator');
		});

		it('should return all valid fields', () => {
			const mockSchema = new ParsedMetadataSchema([
				{
					field: OBJECT_FIELDS.TITLE,
					label: 'Title',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Mandatory',
					purpose: 'Object title',
					fieldTypeAndControls: 'Free text',
					example: 'Example Title',
				},
				{
					field: 'dcterms:creator',
					label: 'Creator',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Creator name',
					fieldTypeAndControls: 'Free text',
					example: 'John Doe',
				},
				{
					field: 'dcterms:date',
					label: 'Date',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Date',
					fieldTypeAndControls: 'ISO8601 compliant date',
					example: '2024-01-01',
				},
				{
					field: 'dcterms:subject',
					label: 'Subject',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Subject',
					fieldTypeAndControls: 'Free text',
					example: 'Art',
				},
			]);
			const object: ObjectData = {
				[OBJECT_FIELDS.TITLE]: 'Test Title',
				'dcterms:creator': 'Test Creator',
				'dcterms:date': '2024',
				'dcterms:subject': 'Test Subject',
			};

			const result = getFieldsToDisplay(mockSchema, object);

			// Should exclude title but include other populated fields
			expect(result.length).toBe(3);
			expect(result.map((f) => f.field)).toEqual(['dcterms:creator', 'dcterms:date', 'dcterms:subject']);
		});

		it('should handle objects with missing fields', () => {
			const mockSchema = new ParsedMetadataSchema([
				{
					field: 'dcterms:creator',
					label: 'Creator',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Creator name',
					fieldTypeAndControls: 'Free text',
					example: 'John Doe',
				},
				{
					field: 'dcterms:date',
					label: 'Date',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Date',
					fieldTypeAndControls: 'ISO8601 compliant date',
					example: '2024-01-01',
				},
			]);
			const object: ObjectData = {
				'dcterms:creator': 'Test Creator',
				// dcterms:date is missing
			};

			const result = getFieldsToDisplay(mockSchema, object);

			expect(result.length).toBe(1);
			expect(result[0].field).toBe('dcterms:creator');
		});

		it('should maintain field order from schema', () => {
			const mockSchema = new ParsedMetadataSchema([
				{
					field: 'dcterms:date',
					label: 'Date',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Date',
					fieldTypeAndControls: 'ISO8601 compliant date',
					example: '2024-01-01',
				},
				{
					field: 'dcterms:creator',
					label: 'Creator',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Creator name',
					fieldTypeAndControls: 'Free text',
					example: 'John Doe',
				},
				{
					field: 'dcterms:subject',
					label: 'Subject',
					namespace: 'Dublin Core',
					applicableCollections: 'All',
					required: 'Optional',
					purpose: 'Subject',
					fieldTypeAndControls: 'Free text',
					example: 'Art',
				},
			]);
			const object: ObjectData = {
				'dcterms:date': '2024',
				'dcterms:creator': 'Test Creator',
				'dcterms:subject': 'Test Subject',
			};

			const result = getFieldsToDisplay(mockSchema, object);

			expect(result[0].field).toBe('dcterms:date');
			expect(result[1].field).toBe('dcterms:creator');
			expect(result[2].field).toBe('dcterms:subject');
		});
	});
});
