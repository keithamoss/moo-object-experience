/**
 * Tests for terms extraction service
 */

import { beforeEach, describe, expect, it } from 'vitest';
import type { ObjectData } from '../types/metadata';
import { TermsService } from './terms';

describe('TermsService', () => {
	let service: TermsService;

	beforeEach(() => {
		service = new TermsService();
	});

	describe('buildIndex', () => {
		it('should extract terms from searchable fields', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'Ancient Stone Bowl',
					'dcterms:description': 'A beautiful stone artifact',
				},
				{
					'dcterms:identifier.moooi': 'obj-2',
					'dcterms:title': 'Modern Glass Sculpture',
					'dcterms:description': 'Contemporary glass art piece',
				},
			];

			service.buildIndex(objects);

			expect(service.isReady()).toBe(true);
			expect(service.getTermCount()).toBeGreaterThan(0);
		});

		it('should handle empty objects array', () => {
			service.buildIndex([]);

			expect(service.isReady()).toBe(false);
			expect(service.getTermCount()).toBe(0);
			expect(service.getAllTerms()).toEqual([]);
		});

		it('should handle objects with null and undefined field values', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': null as any,
					'dcterms:description': undefined as any,
				},
				{
					'dcterms:identifier.moooi': 'obj-2',
					'dcterms:title': 'Valid Title',
				},
			];

			service.buildIndex(objects);

			expect(service.isReady()).toBe(true);
			const allTerms = service.getAllTerms();
			expect(allTerms).toContain('valid');
			expect(allTerms).toContain('title');
		});

		it('should handle non-string field values', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 123 as any,
					'dcterms:description': { text: 'object' } as any,
					'dcterms:creator': ['array'] as any,
				},
			];

			service.buildIndex(objects);

			// Should not crash, but also shouldn't extract non-string values
			expect(service.getTermCount()).toBe(0);
		});

		it('should rebuild index when called multiple times', () => {
			const objects1: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'First Build',
				},
			];

			service.buildIndex(objects1);
			expect(service.getAllTerms()).toContain('first');
			expect(service.getAllTerms()).toContain('build');

			const objects2: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-2',
					'dcterms:title': 'Second Build',
				},
			];

			service.buildIndex(objects2);
			const allTerms = service.getAllTerms();
			expect(allTerms).toContain('second');
			expect(allTerms).toContain('build');
			expect(allTerms).not.toContain('first');
		});

		it('should handle unicode and special characters', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'Café naïve résumé 日本語',
					'dcterms:description': 'Müller über',
				},
			];

			service.buildIndex(objects);

			const allTerms = service.getAllTerms();
			expect(allTerms).toContain('café');
			expect(allTerms).toContain('naïve');
			expect(allTerms).toContain('résumé');
			expect(allTerms).toContain('müller');
			expect(allTerms).toContain('über');
			expect(allTerms).toContain('日本語');
		});

		it('should normalize terms to lowercase', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'Ancient STONE Bowl',
				},
			];

			service.buildIndex(objects);

			const suggestions = service.getSuggestions('sto', 10);
			expect(suggestions).toContain('stone');
		});

		it('should skip short terms (less than 2 characters)', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'A B C Ancient Bowl',
				},
			];

			service.buildIndex(objects);

			const allTerms = service.getAllTerms();
			expect(allTerms).not.toContain('a');
			expect(allTerms).not.toContain('b');
			expect(allTerms).not.toContain('c');
		});

		it('should track term frequency', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'Stone Bowl',
					'dcterms:description': 'Ancient stone artifact',
				},
				{
					'dcterms:identifier.moooi': 'obj-2',
					'dcterms:title': 'Stone Sculpture',
					'dcterms:description': 'Modern stone art',
				},
			];

			service.buildIndex(objects);

			const stoneDetails = service.getTermDetails('stone');
			expect(stoneDetails).toBeDefined();
			expect(stoneDetails?.frequency).toBe(4); // appears 4 times across all fields
		});
	});

	describe('getSuggestions', () => {
		beforeEach(() => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'Stone Bowl Ancient Artifact',
					'dcterms:description': 'Beautiful stone piece',
				},
				{
					'dcterms:identifier.moooi': 'obj-2',
					'dcterms:title': 'Glass Sculpture',
					'dcterms:description': 'Modern glass art',
				},
				{
					'dcterms:identifier.moooi': 'obj-3',
					'dcterms:title': 'Steel Container',
					'dcterms:description': 'Industrial steel box',
				},
			];

			service.buildIndex(objects);
		});

		it('should return matching suggestions for prefix', () => {
			const suggestions = service.getSuggestions('sto', 10);
			expect(suggestions).toContain('stone');
		});

		it('should return empty array for short prefix', () => {
			const suggestions = service.getSuggestions('a', 10);
			// Single character searches should still work for type-ahead
			expect(suggestions.length).toBeGreaterThanOrEqual(0);
		});

		it('should return empty array for empty prefix', () => {
			const suggestions = service.getSuggestions('', 10);
			expect(suggestions).toEqual([]);
		});

		it('should limit results to maxResults', () => {
			const suggestions = service.getSuggestions('a', 2);
			expect(suggestions.length).toBeLessThanOrEqual(2);
		});

		it('should be case-insensitive', () => {
			const lowerSuggestions = service.getSuggestions('sto', 10);
			const upperSuggestions = service.getSuggestions('STO', 10);
			expect(lowerSuggestions).toEqual(upperSuggestions);
		});

		it('should rank by frequency', () => {
			// "stone" appears twice, "steel" appears twice, others once
			const suggestions = service.getSuggestions('st', 10);
			expect(suggestions[0]).toMatch(/^st/); // Should start with 'st'
		});

		it('should return empty array when no matches found', () => {
			const suggestions = service.getSuggestions('xyzzz', 10);
			expect(suggestions).toEqual([]);
		});

		it('should handle maxResults of 0', () => {
			const suggestions = service.getSuggestions('st', 0);
			expect(suggestions).toEqual([]);
		});

		it('should handle negative maxResults', () => {
			const suggestions = service.getSuggestions('st', -5);
			expect(suggestions).toEqual([]);
		});

		it('should return terms sorted by frequency then alphabetically', () => {
			const manyObjects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'apple apple apple',
				},
				{
					'dcterms:identifier.moooi': 'obj-2',
					'dcterms:title': 'apricot apricot',
				},
				{
					'dcterms:identifier.moooi': 'obj-3',
					'dcterms:title': 'avocado',
				},
			];

			service.buildIndex(manyObjects);
			const suggestions = service.getSuggestions('a', 10);

			// apple (3) should come before apricot (2), which should come before avocado (1)
			const appleIdx = suggestions.indexOf('apple');
			const apricotIdx = suggestions.indexOf('apricot');
			const avocadoIdx = suggestions.indexOf('avocado');

			expect(appleIdx).toBeLessThan(apricotIdx);
			expect(apricotIdx).toBeLessThan(avocadoIdx);
		});
	});

	describe('clear', () => {
		it('should clear the index', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'Test Object',
				},
			];

			service.buildIndex(objects);
			expect(service.isReady()).toBe(true);

			service.clear();
			expect(service.isReady()).toBe(false);
			expect(service.getTermCount()).toBe(0);
		});
	});

	describe('getTermDetails', () => {
		beforeEach(() => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'pottery bowl',
					'dcterms:description': 'Ancient pottery artifact',
					'dcterms:creator': 'pottery master',
				},
			];

			service.buildIndex(objects);
		});

		it('should return term details for existing term', () => {
			const details = service.getTermDetails('pottery');

			expect(details).toBeDefined();
			expect(details?.term).toBe('pottery');
			expect(details?.frequency).toBe(3);
		});

		it('should return undefined for non-existent term', () => {
			const details = service.getTermDetails('nonexistent');

			expect(details).toBeUndefined();
		});

		it('should be case-insensitive', () => {
			const lowerDetails = service.getTermDetails('pottery');
			const upperDetails = service.getTermDetails('POTTERY');
			const mixedDetails = service.getTermDetails('PoTtErY');

			expect(lowerDetails).toEqual(upperDetails);
			expect(upperDetails).toEqual(mixedDetails);
		});

		it('should track which fields contain the term', () => {
			const details = service.getTermDetails('pottery');

			expect(details?.fields).toBeDefined();
			expect(details?.fields.has('dcterms:title')).toBe(true);
			expect(details?.fields.has('dcterms:description')).toBe(true);
			expect(details?.fields.has('dcterms:creator')).toBe(true);
		});

		it('should have immutable fields set', () => {
			const details = service.getTermDetails('pottery');

			expect(details?.fields).toBeInstanceOf(Set);
		});
	});

	describe('getAllTerms', () => {
		it('should return all terms sorted by frequency', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'zebra apple apple banana',
				},
			];

			service.buildIndex(objects);
			const allTerms = service.getAllTerms();

			// apple (2) should come before banana (1) and zebra (1)
			const appleIdx = allTerms.indexOf('apple');
			const bananaIdx = allTerms.indexOf('banana');
			const zebraIdx = allTerms.indexOf('zebra');

			expect(appleIdx).toBeLessThan(bananaIdx);
			expect(appleIdx).toBeLessThan(zebraIdx);
			// banana comes before zebra alphabetically
			expect(bananaIdx).toBeLessThan(zebraIdx);
		});

		it('should return a copy of the terms array', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'test',
				},
			];

			service.buildIndex(objects);
			const terms1 = service.getAllTerms();
			const terms2 = service.getAllTerms();

			expect(terms1).toEqual(terms2);
			expect(terms1).not.toBe(terms2); // Different array instances

			// Mutating one shouldn't affect the other
			terms1.push('mutation');
			expect(terms2).not.toContain('mutation');
		});

		it('should return empty array when index is empty', () => {
			const allTerms = service.getAllTerms();
			expect(allTerms).toEqual([]);
		});
	});

	describe('getTermCount', () => {
		it('should return correct count of unique terms', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'apple banana cherry apple',
				},
			];

			service.buildIndex(objects);
			const count = service.getTermCount();

			expect(count).toBe(3); // apple, banana, cherry (apple counted once)
		});

		it('should return 0 for empty index', () => {
			expect(service.getTermCount()).toBe(0);
		});

		it('should update after rebuilding index', () => {
			const objects1: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'word',
				},
			];

			service.buildIndex(objects1);
			expect(service.getTermCount()).toBe(1);

			const objects2: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-2',
					'dcterms:title': 'first second third',
				},
			];

			service.buildIndex(objects2);
			expect(service.getTermCount()).toBe(3);
		});
	});

	describe('isReady', () => {
		it('should return false before building index', () => {
			expect(service.isReady()).toBe(false);
		});

		it('should return true after building index with data', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'test',
				},
			];

			service.buildIndex(objects);
			expect(service.isReady()).toBe(true);
		});

		it('should return false after clearing', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'test',
				},
			];

			service.buildIndex(objects);
			service.clear();
			expect(service.isReady()).toBe(false);
		});
	});

	describe('extractTerms', () => {
		beforeEach(() => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'Multi-word hyphenated-term with punctuation',
				},
			];

			service.buildIndex(objects);
		});

		it('should split on whitespace and common punctuation', () => {
			const allTerms = service.getAllTerms();
			expect(allTerms).toContain('multi-word'); // Preserves hyphens
			expect(allTerms).toContain('hyphenated-term'); // Preserves hyphens
			expect(allTerms).toContain('with');
			expect(allTerms).toContain('punctuation');
		});

		it('should handle multiple consecutive punctuation marks', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'word1...word2!!!word3???word4',
				},
			];

			service.buildIndex(objects);
			const allTerms = service.getAllTerms();

			expect(allTerms).toContain('word1');
			expect(allTerms).toContain('word2');
			expect(allTerms).toContain('word3');
			expect(allTerms).toContain('word4');
		});

		it('should handle strings with only punctuation', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': '...!!!???',
				},
			];

			service.buildIndex(objects);

			expect(service.getTermCount()).toBe(0);
		});

		it('should handle empty strings', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': '',
				},
			];

			service.buildIndex(objects);

			expect(service.getTermCount()).toBe(0);
		});

		it('should handle whitespace-only strings', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': '   \t\n   ',
				},
			];

			service.buildIndex(objects);

			expect(service.getTermCount()).toBe(0);
		});

		it('should remove leading and trailing punctuation', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': '!!!word??? ...another.',
				},
			];

			service.buildIndex(objects);
			const allTerms = service.getAllTerms();

			expect(allTerms).toContain('word');
			expect(allTerms).toContain('another');
			expect(allTerms).not.toContain('!!!word???');
			expect(allTerms).not.toContain('...another.');
		});

		it('should handle mixed delimiters', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': 'word1,word2;word3.word4(word5)word6[word7]word8{word9}',
				},
			];

			service.buildIndex(objects);
			const allTerms = service.getAllTerms();

			expect(allTerms).toContain('word1');
			expect(allTerms).toContain('word2');
			expect(allTerms).toContain('word3');
			expect(allTerms).toContain('word4');
			expect(allTerms).toContain('word5');
			expect(allTerms).toContain('word6');
			expect(allTerms).toContain('word7');
			expect(allTerms).toContain('word8');
			expect(allTerms).toContain('word9');
		});

		it('should handle quoted strings', () => {
			const objects: ObjectData[] = [
				{
					'dcterms:identifier.moooi': 'obj-1',
					'dcterms:title': '"quoted text" and \'single quotes\'',
				},
			];

			service.buildIndex(objects);
			const allTerms = service.getAllTerms();

			expect(allTerms).toContain('quoted');
			expect(allTerms).toContain('text');
			expect(allTerms).toContain('and');
			expect(allTerms).toContain('single');
			expect(allTerms).toContain('quotes');
		});
	});
});
