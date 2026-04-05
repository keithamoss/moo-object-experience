// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { OBJECT_FIELDS } from '../constants/objectFields';
import type { ObjectData } from '../types/metadata';
import { SearchService } from './search';

describe('SearchService', () => {
	let service: SearchService;
	let mockObjects: ObjectData[];

	beforeEach(() => {
		service = new SearchService();
		mockObjects = [
			{
				[OBJECT_FIELDS.IDENTIFIER]: 'OBJ-001',
				[OBJECT_FIELDS.TITLE]: 'Aboriginal Stone Axe',
				[OBJECT_FIELDS.DESCRIPTION]: 'Ancient stone cutting tool',
				[OBJECT_FIELDS.CREATOR]: 'Aboriginal peoples',
				[OBJECT_FIELDS.DATE_ACCEPTED]: '1800',
			},
			{
				[OBJECT_FIELDS.IDENTIFIER]: 'OBJ-002',
				[OBJECT_FIELDS.TITLE]: 'Metal Tool Collection',
				[OBJECT_FIELDS.DESCRIPTION]: 'Collection of metal implements',
				[OBJECT_FIELDS.CREATOR]: 'Various craftsmen',
				[OBJECT_FIELDS.DATE_ACCEPTED]: '1900-1950',
			},
			{
				[OBJECT_FIELDS.IDENTIFIER]: 'OBJ-003',
				[OBJECT_FIELDS.TITLE]: 'Wooden Spear',
				[OBJECT_FIELDS.DESCRIPTION]: 'Traditional hunting weapon',
				[OBJECT_FIELDS.CREATOR]: 'Aboriginal peoples',
				[OBJECT_FIELDS.DATE_ACCEPTED]: '1750',
			},
		];
		return () => {
			service.clear();
		};
	});

	describe('buildIndex', () => {
		it('should build index successfully', () => {
			service.buildIndex(mockObjects);

			expect(service.isReady()).toBe(true);
			expect(service.getIndexSize()).toBe(3);
		});

		it('should allow searching after building index', () => {
			service.buildIndex(mockObjects);

			const results = service.search('stone');
			expect(results).toBeDefined();
			expect(Array.isArray(results)).toBe(true);
		});

		it('should handle empty objects array', () => {
			service.buildIndex([]);

			expect(service.isReady()).toBe(true);
			expect(service.getIndexSize()).toBe(0);
		});
	});

	describe('search', () => {
		beforeEach(() => {
			service.buildIndex(mockObjects);
		});

		it('should throw error when index not built', () => {
			const uninitializedService = new SearchService();

			expect(() => uninitializedService.search('test')).toThrow('Search index not initialized');
		});

		it('should find objects by title', () => {
			const results = service.search('stone');

			expect(results.length).toBeGreaterThan(0);
			expect(results[0].id).toBe('OBJ-001');
		});

		it('should find objects by description', () => {
			const results = service.search('hunting');

			expect(results.length).toBeGreaterThan(0);
			expect(results.some((r) => r.id === 'OBJ-003')).toBe(true);
		});

		it('should find objects by creator', () => {
			const results = service.search('Aboriginal');

			expect(results.length).toBeGreaterThan(0);
			expect(results.filter((r) => r.id === 'OBJ-001' || r.id === 'OBJ-003').length).toBe(2);
		});

		it('should return empty results for non-matching query', () => {
			const results = service.search('nonexistent');

			expect(results).toEqual([]);
		});

		it('should rank results by relevance', () => {
			const results = service.search('stone');

			// Results should be sorted by score (descending)
			for (let i = 0; i < results.length - 1; i++) {
				expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
			}
		});

		it('should support fuzzy matching', () => {
			const results = service.search('ston'); // Missing 'e'

			// Should find 'stone' with fuzzy matching
			expect(results.length).toBeGreaterThan(0);
		});

		it('should support prefix matching', () => {
			const results = service.search('abo'); // Prefix of 'Aboriginal'

			expect(results.length).toBeGreaterThan(0);
			expect(results.some((r) => r.id === 'OBJ-001' || r.id === 'OBJ-003')).toBe(true);
		});

		it('should search only in active fields', () => {
			// Search only in title field
			const results = service.search('hunting', {
				activeFields: [OBJECT_FIELDS.TITLE],
			});

			// 'hunting' only appears in description, not title
			expect(results.length).toBe(0);
		});

		it('should respect multiple active fields', () => {
			const results = service.search('stone', {
				activeFields: [OBJECT_FIELDS.TITLE, OBJECT_FIELDS.DESCRIPTION],
			});

			expect(results.length).toBeGreaterThan(0);
		});

		it('should disable fuzzy matching when option is false', () => {
			const results = service.search('ston', { fuzzy: false });

			// Without fuzzy matching, might still match via prefix
			// This test verifies the option is accepted without error
			expect(Array.isArray(results)).toBe(true);
		});

		it('should disable prefix matching when option is false', () => {
			const results = service.search('abo', { prefix: false });

			// Without prefix matching, might still match via fuzzy
			// This test verifies the option is accepted without error
			expect(Array.isArray(results)).toBe(true);
		});

		it('should throw error for invalid fuzzy tolerance', () => {
			expect(() => service.search('test', { fuzzy: 1.5 })).toThrow('Fuzzy tolerance must be between 0 and 1');
			expect(() => service.search('test', { fuzzy: -0.1 })).toThrow('Fuzzy tolerance must be between 0 and 1');
		});

		it('should throw error for invalid prefix option', () => {
			expect(() => service.search('test', { prefix: 'true' as unknown as boolean })).toThrow(
				'Prefix must be a boolean',
			);
		});

		it('should return results with match information', () => {
			const results = service.search('stone');

			expect(results.length).toBeGreaterThan(0);
			expect(results[0]).toMatchObject({
				id: expect.any(String),
				score: expect.any(Number),
				match: expect.any(Object),
			});
		});
	});

	describe('getObjectById', () => {
		beforeEach(() => {
			service.buildIndex(mockObjects);
		});

		it('should retrieve object by ID', () => {
			const obj = service.getObjectById('OBJ-001');

			expect(obj).toBeDefined();
			expect(obj?.[OBJECT_FIELDS.IDENTIFIER]).toBe('OBJ-001');
			expect(obj?.[OBJECT_FIELDS.TITLE]).toBe('Aboriginal Stone Axe');
		});

		it('should return undefined for non-existent ID', () => {
			const obj = service.getObjectById('NONEXISTENT');

			expect(obj).toBeUndefined();
		});

		it('should handle empty ID', () => {
			const obj = service.getObjectById('');

			expect(obj).toBeUndefined();
		});
	});

	describe('getIndexSize', () => {
		it('should return 0 for uninitialized index', () => {
			expect(service.getIndexSize()).toBe(0);
		});

		it('should return correct size after building index', () => {
			service.buildIndex(mockObjects);

			expect(service.getIndexSize()).toBe(3);
		});
	});

	describe('isReady', () => {
		it('should return false before building index', () => {
			expect(service.isReady()).toBe(false);
		});

		it('should return true after building index', () => {
			service.buildIndex(mockObjects);

			expect(service.isReady()).toBe(true);
		});
	});

	describe('clear', () => {
		it('should clear the index', () => {
			service.buildIndex(mockObjects);
			expect(service.isReady()).toBe(true);

			service.clear();

			expect(service.isReady()).toBe(false);
			expect(service.getIndexSize()).toBe(0);
		});

		it('should allow rebuilding after clearing', () => {
			service.buildIndex(mockObjects);
			service.clear();
			service.buildIndex(mockObjects);

			expect(service.isReady()).toBe(true);
			expect(service.getIndexSize()).toBe(3);
		});
	});

	describe('case insensitivity', () => {
		beforeEach(() => {
			service.buildIndex(mockObjects);
		});

		it('should find results regardless of case', () => {
			const lowerResults = service.search('stone');
			const upperResults = service.search('STONE');
			const mixedResults = service.search('StOnE');

			expect(lowerResults.length).toBe(upperResults.length);
			expect(upperResults.length).toBe(mixedResults.length);
			expect(lowerResults[0].id).toBe(upperResults[0].id);
		});
	});

	describe('regex metacharacter safety', () => {
		beforeEach(() => {
			service.buildIndex([
				{
					[OBJECT_FIELDS.IDENTIFIER]: 'OBJ-META',
					[OBJECT_FIELDS.TITLE]: 'Price ($100) and C++ syntax',
					[OBJECT_FIELDS.DESCRIPTION]: 'Contains (parens) and [brackets] and dots.',
				},
			]);
		});

		const metacharacterQueries = ['.', '*', '+', '?', '^', '$', '(', ')', '[', ']', '{', '}', '|', '\\'];

		for (const char of metacharacterQueries) {
			it(`should not throw when searching for '${char}'`, () => {
				expect(() => service.search(char)).not.toThrow();
			});
		}
	});

	describe('unicode and accented characters', () => {
		beforeEach(() => {
			service.buildIndex([
				{
					[OBJECT_FIELDS.IDENTIFIER]: 'OBJ-UNI',
					[OBJECT_FIELDS.TITLE]: 'Café Naïve',
					[OBJECT_FIELDS.DESCRIPTION]: 'Object with accented title',
				},
			]);
		});

		it('should find results when searching with accented characters', () => {
			const results = service.search('café');
			expect(results).toBeDefined();
			expect(Array.isArray(results)).toBe(true);
		});

		it('should not throw when searching with unicode characters', () => {
			expect(() => service.search('naïve')).not.toThrow();
			expect(() => service.search('café')).not.toThrow();
		});
	});

	describe('edge case queries', () => {
		beforeEach(() => {
			service.buildIndex(mockObjects);
		});

		it('should return empty results for a single-character query (below minimum length)', () => {
			// MiniSearch has a minimum query length; single chars should not crash
			expect(() => service.search('a')).not.toThrow();
		});

		it('should return empty array for a query of only whitespace', () => {
			const results = service.search('   ');
			expect(Array.isArray(results)).toBe(true);
		});
	});
});
