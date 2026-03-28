// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { OBJECT_FIELDS } from '../../constants/objectFields';
import type { MetadataField, ObjectData } from '../../types/metadata';
import { extractObjectDisplayData } from './useObjectDisplay';

const baseMetadata: MetadataField[] = [
	{
		field: OBJECT_FIELDS.TITLE,
		namespace: 'Dublin Core',
		label: 'Title',
		applicableCollections: 'All',
		required: 'Mandatory',
		purpose: 'Object title',
		fieldTypeAndControls: 'Free text',
		example: '',
	},
	{
		field: OBJECT_FIELDS.IDENTIFIER,
		namespace: 'Dublin Core',
		label: 'Identifier',
		applicableCollections: 'All',
		required: 'Mandatory',
		purpose: 'Object identifier',
		fieldTypeAndControls: 'Free text',
		example: '',
	},
	{
		field: OBJECT_FIELDS.DESCRIPTION,
		namespace: 'Dublin Core',
		label: 'Description',
		applicableCollections: 'All',
		required: 'Optional',
		purpose: 'Object description',
		fieldTypeAndControls: 'Free text',
		example: '',
	},
	{
		field: OBJECT_FIELDS.CREATOR,
		namespace: 'Dublin Core',
		label: 'Creator',
		applicableCollections: 'All',
		required: 'Optional',
		purpose: 'Who created it',
		fieldTypeAndControls: 'Free text',
		example: '',
	},
];

const baseObject: ObjectData = {
	[OBJECT_FIELDS.IDENTIFIER]: 'OBJ-001',
	[OBJECT_FIELDS.TITLE]: 'Stone Axe',
	[OBJECT_FIELDS.DESCRIPTION]: 'An ancient cutting tool.',
	[OBJECT_FIELDS.CREATOR]: 'Aboriginal peoples',
};

describe('extractObjectDisplayData', () => {
	it('should return default values when object is undefined', () => {
		const result = extractObjectDisplayData({ object: undefined, metadata: baseMetadata });

		expect(result.title).toBe('');
		expect(result.identifier).toBe('');
		expect(result.description).toBeUndefined();
		expect(result.imageUrls).toEqual([]);
		expect(result.fieldsToDisplay).toEqual([]);
	});

	it('should extract title from object', () => {
		const result = extractObjectDisplayData({ object: baseObject, metadata: baseMetadata });

		expect(result.title).toBe('Stone Axe');
	});

	it('should fall back to "Untitled" when title field is missing', () => {
		const objectWithoutTitle: ObjectData = {
			[OBJECT_FIELDS.IDENTIFIER]: 'OBJ-001',
		};

		const result = extractObjectDisplayData({ object: objectWithoutTitle, metadata: baseMetadata });

		expect(result.title).toBe('Untitled');
	});

	it('should extract identifier from object', () => {
		const result = extractObjectDisplayData({ object: baseObject, metadata: baseMetadata });

		expect(result.identifier).toBe('OBJ-001');
	});

	it('should extract description from object', () => {
		const result = extractObjectDisplayData({ object: baseObject, metadata: baseMetadata });

		expect(result.description).toBe('An ancient cutting tool.');
	});

	it('should return undefined description when description field is missing', () => {
		const objectWithoutDesc: ObjectData = {
			[OBJECT_FIELDS.IDENTIFIER]: 'OBJ-001',
			[OBJECT_FIELDS.TITLE]: 'Stone Axe',
		};

		const result = extractObjectDisplayData({ object: objectWithoutDesc, metadata: baseMetadata });

		expect(result.description).toBeUndefined();
	});

	it('should use metadata label for identifierLabel', () => {
		const result = extractObjectDisplayData({ object: baseObject, metadata: baseMetadata });

		expect(result.identifierLabel).toBe('Identifier');
	});

	it('should fall back to "Identifier" when metadata has no label', () => {
		const result = extractObjectDisplayData({ object: baseObject, metadata: [] });

		expect(result.identifierLabel).toBe('Identifier');
	});

	it('should exclude title, identifier, and description from fieldsToDisplay', () => {
		const result = extractObjectDisplayData({ object: baseObject, metadata: baseMetadata });

		const displayedFieldNames = result.fieldsToDisplay.map((f) => f.field);
		expect(displayedFieldNames).not.toContain(OBJECT_FIELDS.TITLE);
		expect(displayedFieldNames).not.toContain(OBJECT_FIELDS.IDENTIFIER);
		expect(displayedFieldNames).not.toContain(OBJECT_FIELDS.DESCRIPTION);
	});

	it('should include non-hero fields that have a value in fieldsToDisplay', () => {
		const result = extractObjectDisplayData({ object: baseObject, metadata: baseMetadata });

		const displayedFieldNames = result.fieldsToDisplay.map((f) => f.field);
		expect(displayedFieldNames).toContain(OBJECT_FIELDS.CREATOR);
	});

	it('should exclude fields with empty values from fieldsToDisplay', () => {
		const objectWithEmptyCreator: ObjectData = {
			...baseObject,
			[OBJECT_FIELDS.CREATOR]: '',
		};

		const result = extractObjectDisplayData({ object: objectWithEmptyCreator, metadata: baseMetadata });

		const displayedFieldNames = result.fieldsToDisplay.map((f) => f.field);
		expect(displayedFieldNames).not.toContain(OBJECT_FIELDS.CREATOR);
	});

	it('should return empty imageUrls when no image fields exist in metadata', () => {
		const result = extractObjectDisplayData({ object: baseObject, metadata: baseMetadata });

		expect(result.imageUrls).toEqual([]);
	});
});
