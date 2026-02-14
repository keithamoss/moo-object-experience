import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ALL_SEARCHABLE_FIELD_NAMES, MIN_QUERY_LENGTH } from '../config/searchConfig';
import { searchService } from '../services/search';
import { createTestStore } from '../test-utils/test-helpers';
import searchReducer, {
    clearSearch,
    resetSearch,
    SearchState,
    selectActiveSearchFields,
    selectCanSearch,
    selectHasResults,
    selectIndexReady,
    selectIsQueryValid,
    selectResultCount,
    selectSearchQuery,
    selectSearchResults,
    setActiveFields,
    setIndexReady,
    setQuery,
    toggleSearchField,
} from './searchSlice';

describe('searchSlice', () => {
  describe('reducer', () => {
    const initialState: SearchState = {
      query: '',
      results: [],
      activeSearchFields: ALL_SEARCHABLE_FIELD_NAMES,
      indexReady: false,
    };

    it('should return initial state', () => {
      expect(searchReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setQuery', () => {
      const state = searchReducer(initialState, setQuery('stone'));
      expect(state.query).toBe('stone');
    });

    it('should handle toggleSearchField to remove field', () => {
      const state = searchReducer(initialState, toggleSearchField('dcterms:title'));
      expect(state.activeSearchFields).not.toContain('dcterms:title');
    });

    it('should handle toggleSearchField to add field', () => {
      const stateWithoutField: SearchState = {
        ...initialState,
        activeSearchFields: ['dcterms:description'],
      };
      const state = searchReducer(stateWithoutField, toggleSearchField('dcterms:title'));
      expect(state.activeSearchFields).toContain('dcterms:title');
    });

    it('should handle setActiveFields', () => {
      const fields: SearchState['activeSearchFields'] = ['dcterms:title', 'dcterms:description'];
      const state = searchReducer(initialState, setActiveFields(fields));
      expect(state.activeSearchFields).toEqual(fields);
    });

    it('should handle clearSearch', () => {
      const stateWithSearch = {
        ...initialState,
        query: 'test',
        results: [{ id: '1', score: 1, match: {} }],
      };
      const state = searchReducer(stateWithSearch, clearSearch());
      expect(state.query).toBe('');
      expect(state.results).toEqual([]);
    });

    it('should handle setIndexReady', () => {
      const state = searchReducer(initialState, setIndexReady(true));
      expect(state.indexReady).toBe(true);
    });

    it('should handle resetSearch', () => {
      const modifiedState: SearchState = {
        query: 'test',
        results: [{ id: '1', score: 1, match: {} }],
        activeSearchFields: ['dcterms:title'],
        indexReady: true,
      };
      const state = searchReducer(modifiedState, resetSearch());
      expect(state).toEqual(initialState);
    });

    it('should not perform search when query is too short', () => {
      const shortQuery = 'a'.repeat(MIN_QUERY_LENGTH - 1);
      const state = searchReducer(
        { ...initialState, indexReady: true },
        setQuery(shortQuery)
      );
      expect(state.results).toEqual([]);
    });

    it('should not perform search when no active fields', () => {
      const state = searchReducer(
        { ...initialState, indexReady: true, activeSearchFields: [] },
        setQuery('test query')
      );
      expect(state.results).toEqual([]);
    });
  });

  describe('selectors', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    it('should select search query', () => {
      store.dispatch(setQuery('stone'));
      expect(selectSearchQuery(store.getState())).toBe('stone');
    });

    it('should select search results', () => {
      expect(selectSearchResults(store.getState())).toEqual([]);
    });

    it('should select active search fields', () => {
      expect(selectActiveSearchFields(store.getState())).toEqual(ALL_SEARCHABLE_FIELD_NAMES);
    });

    it('should select index ready', () => {
      expect(selectIndexReady(store.getState())).toBe(false);
      store.dispatch(setIndexReady(true));
      expect(selectIndexReady(store.getState())).toBe(true);
    });

    it('should select result count', () => {
      expect(selectResultCount(store.getState())).toBe(0);
    });

    it('should select has results', () => {
      expect(selectHasResults(store.getState())).toBe(false);
    });

    it('should select is query valid', () => {
      expect(selectIsQueryValid(store.getState())).toBe(false);
      store.dispatch(setQuery('stone'));
      expect(selectIsQueryValid(store.getState())).toBe(true);
    });

    it('should select can search', () => {
      expect(selectCanSearch(store.getState())).toBe(false);
      
      // Build index first so setQuery can perform search
      searchService.buildIndex([
        {
          'dcterms:identifier.moooi': 'TEST-001',
          'dcterms:title': 'Test Object',
          'dcterms:description': 'Test Description',
        },
      ]);
      
      store.dispatch(setIndexReady(true));
      store.dispatch(setQuery('stone'));
      
      expect(selectCanSearch(store.getState())).toBe(true);
    });

    it('should select can search as false when no active fields', () => {
      // Build index first so setQuery can perform search
      searchService.buildIndex([
        {
          'dcterms:identifier.moooi': 'TEST-001',
          'dcterms:title': 'Test Object',
          'dcterms:description': 'Test Description',
        },
      ]);
      
      store.dispatch(setIndexReady(true));
      store.dispatch(setQuery('stone'));
      store.dispatch(setActiveFields([]));
      
      expect(selectCanSearch(store.getState())).toBe(false);
    });
  });

  describe('integration with search service', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      // Clear and rebuild for each test
      searchService.clear();
      
      store = createTestStore();
      
      // Build search index
      searchService.buildIndex([
        {
          'dcterms:identifier.moooi': 'OBJ-001',
          'dcterms:title': 'Stone Axe',
          'dcterms:description': 'Ancient tool',
        },
        {
          'dcterms:identifier.moooi': 'OBJ-002',
          'dcterms:title': 'Metal Tool',
          'dcterms:description': 'Modern implement',
        },
      ]);
      
      store.dispatch(setIndexReady(true));
    });

    afterEach(() => {
      searchService.clear();
    });

    it('should perform search and get results', () => {
      store.dispatch(setQuery('stone'));
      
      const results = selectSearchResults(store.getState());
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('OBJ-001');
    });

    it('should filter results by active fields', () => {
      // Search only in title field
      store.dispatch(setActiveFields(['dcterms:title']));
      store.dispatch(setQuery('ancient'));
      
      // 'ancient' only appears in description, not title
      const results = selectSearchResults(store.getState());
      expect(results.length).toBe(0);
    });

    it('should update results when toggling fields', () => {
      store.dispatch(setQuery('stone'));
      
      const initialResults = selectSearchResults(store.getState());
      expect(initialResults.length).toBeGreaterThan(0);
      
      // Remove title field (where 'stone' appears)
      store.dispatch(toggleSearchField('dcterms:title'));
      
      const updatedResults = selectSearchResults(store.getState());
      expect(updatedResults.length).toBe(0);
    });
  });
});
