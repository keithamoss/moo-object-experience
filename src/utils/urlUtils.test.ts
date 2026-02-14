import { describe, expect, it } from 'vitest';
import { generateObjectUrl, generateSlug, isValidObjectId, validateObjectForUrl } from './urlUtils';

describe('generateSlug', () => {
	it('should convert text to lowercase slug', () => {
		expect(generateSlug('Aboriginal stone axe head')).toBe('aboriginal-stone-axe-head');
		expect(generateSlug('Stone Tool Collection')).toBe('stone-tool-collection');
	});

	it('should remove special characters', () => {
		expect(generateSlug('Map of W.A. (1950s)')).toBe('map-of-wa-1950s');
		expect(generateSlug('Object #123')).toBe('object-123');
	});

	it('should replace spaces with hyphens', () => {
		expect(generateSlug('test   multiple   spaces')).toBe('test-multiple-spaces');
	});

	it('should remove consecutive hyphens', () => {
		expect(generateSlug('test---slug')).toBe('test-slug');
	});

	it('should trim hyphens from start and end', () => {
		expect(generateSlug('-test-slug-')).toBe('test-slug');
	});

	it('should limit length to 50 characters', () => {
		const longText = 'a'.repeat(100);
		const slug = generateSlug(longText);
		expect(slug.length).toBeLessThanOrEqual(50);
	});

	it('should return empty string for text with only special characters', () => {
		expect(generateSlug('☆✿★')).toBe('');
		expect(generateSlug('!!!')).toBe('');
	});

	it('should handle empty string', () => {
		expect(generateSlug('')).toBe('');
	});

	it('should handle underscores by converting to hyphens', () => {
		expect(generateSlug('test_slug_name')).toBe('test-slug-name');
	});
});

describe('isValidObjectId', () => {
	it('should accept valid object IDs', () => {
		expect(isValidObjectId('OBJ-001')).toBe(true);
		expect(isValidObjectId('ABC123')).toBe(true);
		expect(isValidObjectId('test.id')).toBe(true);
	});

	it('should reject empty strings', () => {
		expect(isValidObjectId('')).toBe(false);
	});

	it('should reject very long IDs', () => {
		const longId = 'a'.repeat(201);
		expect(isValidObjectId(longId)).toBe(false);
	});

	it('should reject IDs with forward slashes', () => {
		expect(isValidObjectId('OBJ/001')).toBe(false);
	});

	it('should reject IDs with backslashes', () => {
		expect(isValidObjectId('OBJ\\001')).toBe(false);
	});

	it('should reject IDs with hash symbols', () => {
		expect(isValidObjectId('OBJ#001')).toBe(false);
	});

	it('should reject IDs with question marks', () => {
		expect(isValidObjectId('OBJ?001')).toBe(false);
	});

	it('should reject IDs with ampersands', () => {
		expect(isValidObjectId('OBJ&001')).toBe(false);
	});

	it('should reject IDs with percent signs', () => {
		expect(isValidObjectId('OBJ%001')).toBe(false);
	});
});

describe('validateObjectForUrl', () => {
	it('should validate valid object', () => {
		const result = validateObjectForUrl('OBJ-001', 'Stone Axe');
		expect(result.valid).toBe(true);
		expect(result.slug).toBe('stone-axe');
		expect(result.error).toBeUndefined();
	});

	it('should reject invalid object ID', () => {
		const result = validateObjectForUrl('OBJ/001', 'Stone Axe');
		expect(result.valid).toBe(false);
		expect(result.error).toContain('Invalid object ID for URL');
	});

	it('should reject object with invalid title', () => {
		const result = validateObjectForUrl('OBJ-001', '☆✿★');
		expect(result.valid).toBe(false);
		expect(result.error).toContain('cannot generate URL');
	});

	it('should handle empty title', () => {
		const result = validateObjectForUrl('OBJ-001', '');
		expect(result.valid).toBe(false);
	});
});

describe('generateObjectUrl', () => {
	it('should generate valid URL', () => {
		expect(generateObjectUrl('OBJ-001', 'Stone Axe')).toBe('/object/OBJ-001/stone-axe');
	});

	it('should encode special characters in ID', () => {
		expect(generateObjectUrl('OBJ 001', 'Stone Axe')).toBe('/object/OBJ%20001/stone-axe');
	});

	it('should throw error for invalid ID', () => {
		expect(() => generateObjectUrl('OBJ/001', 'Stone Axe')).toThrow('Invalid object ID for URL');
	});

	it('should throw error for invalid title', () => {
		expect(() => generateObjectUrl('OBJ-001', '☆✿★')).toThrow('cannot generate URL');
	});

	it('should handle complex titles', () => {
		expect(generateObjectUrl('OBJ-001', 'Map of W.A. (1950s)')).toBe('/object/OBJ-001/map-of-wa-1950s');
	});
});
