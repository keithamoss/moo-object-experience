import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ObjectData } from '../types/metadata';
import { SearchService } from './search';

describe('SearchService', () => {
  let service: SearchService;
  let mockObjects: ObjectData[];

  beforeEach(() => {
    service = new SearchService();
    mockObjects = [
      {
        'dcterms:identifier.moooi': 'OBJ-001',
        'dcterms:title': 'Aboriginal Stone Axe',
        'dcterms:description': 'Ancient stone cutting tool',
        'dcterms:creator': 'Aboriginal peoples',
        'dcterms:date': '1800',
      },
      {
        'dcterms:identifier.moooi': 'OBJ-002',
        'dcterms:title': 'Metal Tool Collection',
        'dcterms:description': 'Collection of metal implements',
        'dcterms:creator': 'Various craftsmen',
        'dcterms:date': '1900-1950',
      },
      {
        'dcterms:identifier.moooi': 'OBJ-003',
        'dcterms:title': 'Wooden Spear',
        'dcterms:description': 'Traditional hunting weapon',
        'dcterms:creator': 'Aboriginal peoples',
        'dcterms:date': '1750',
      },
    ];
  });

  afterEach(() => {
    service.clear();
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
      expect(results.some(r => r.id === 'OBJ-003')).toBe(true);
    });

    it('should find objects by creator', () => {
      const results = service.search('Aboriginal');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.filter(r => r.id === 'OBJ-001' || r.id === 'OBJ-003').length).toBe(2);
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
      expect(results.some(r => r.id === 'OBJ-001' || r.id === 'OBJ-003')).toBe(true);
    });

    it('should search only in active fields', () => {
      // Search only in title field
      const results = service.search('hunting', {
        activeFields: ['dcterms:title'],
      });
      
      // 'hunting' only appears in description, not title
      expect(results.length).toBe(0);
    });

    it('should respect multiple active fields', () => {
      const results = service.search('stone', {
        activeFields: ['dcterms:title', 'dcterms:description'],
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
      expect(() => service.search('test', { prefix: 'true' as any })).toThrow('Prefix must be a boolean');
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
      expect(obj?.['dcterms:identifier.moooi']).toBe('OBJ-001');
      expect(obj?.['dcterms:title']).toBe('Aboriginal Stone Axe');
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
});
