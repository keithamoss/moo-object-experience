/**
 * Redux slice for search state management
 */

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ALL_SEARCHABLE_FIELD_NAMES, MIN_QUERY_LENGTH, SearchableFieldName } from '../config/searchConfig';
import { SearchResult, searchService } from '../services/search';
import type { RootState } from './store';

/**
 * Search state shape
 */
export interface SearchState {
	/** Current search query string */
	query: string;
	/** Array of search results with scores */
	results: SearchResult[];
	/** Which searchable fields are currently active (empty = all active) */
	activeSearchFields: SearchableFieldName[];
	/** Whether search index is ready */
	indexReady: boolean;
}

/**
 * Initial state
 */
const initialState: SearchState = {
	query: '',
	results: [],
	activeSearchFields: ALL_SEARCHABLE_FIELD_NAMES, // All fields active by default
	indexReady: false,
};

/**
 * Helper: Check if search should be performed
 */
function shouldPerformSearch(state: SearchState): boolean {
	const trimmedQuery = state.query.trim();
	return trimmedQuery.length >= MIN_QUERY_LENGTH && state.activeSearchFields.length > 0;
}

/**
 * Helper: Perform search and update results
 */
function performSearch(state: SearchState): void {
	if (state.indexReady && shouldPerformSearch(state)) {
		state.results = searchService.search(state.query, {
			activeFields: state.activeSearchFields,
		});
	} else {
		state.results = [];
	}
}

/**
 * Search slice
 */
export const searchSlice = createSlice({
	name: 'search',
	initialState,
	reducers: {
		/**
		 * Set the search query and perform search
		 */
		setQuery: (state, action: PayloadAction<string>) => {
			state.query = action.payload;
			performSearch(state);
		},

		/**
		 * Toggle a searchable field on/off
		 */
		toggleSearchField: (state, action: PayloadAction<SearchableFieldName>) => {
			const fieldName = action.payload;
			const index = state.activeSearchFields.indexOf(fieldName);

			if (index > -1) {
				// Field is active, remove it
				state.activeSearchFields.splice(index, 1);
			} else {
				// Field is inactive, add it
				state.activeSearchFields.push(fieldName);
			}

			// Re-run search with updated fields
			performSearch(state);
		},

		/**
		 * Set which fields are active (replaces all)
		 */
		setActiveFields: (state, action: PayloadAction<SearchableFieldName[]>) => {
			state.activeSearchFields = action.payload;
			performSearch(state);
		},

		/**
		 * Clear search query and results
		 */
		clearSearch: (state) => {
			state.query = '';
			state.results = [];
		},

		/**
		 * Mark search index as ready (called after building index)
		 */
		setIndexReady: (state, action: PayloadAction<boolean>) => {
			state.indexReady = action.payload;
			// If we have a query waiting, perform search now
			performSearch(state);
		},

		/**
		 * Reset search state to initial values
		 */
		resetSearch: () => initialState,
	},
});

// Export actions
export const { setQuery, toggleSearchField, setActiveFields, clearSearch, setIndexReady, resetSearch } =
	searchSlice.actions;

// Basic selectors (now memoized)
export const selectSearchQuery = createSelector([(state: RootState) => state.search.query], (query) => query);

export const selectSearchResults = createSelector([(state: RootState) => state.search.results], (results) => results);

export const selectActiveSearchFields = createSelector(
	[(state: RootState) => state.search.activeSearchFields],
	(fields) => fields,
);

export const selectIndexReady = (state: RootState): boolean => state.search.indexReady;

// Derived memoized selectors
export const selectResultCount = createSelector([selectSearchResults], (results) => results.length);

export const selectHasResults = createSelector([selectSearchResults], (results) => results.length > 0);

export const selectIsQueryValid = createSelector(
	[selectSearchQuery],
	(query) => query.trim().length >= MIN_QUERY_LENGTH,
);

export const selectCanSearch = createSelector(
	[selectIndexReady, selectIsQueryValid, selectActiveSearchFields],
	(indexReady, isQueryValid, activeFields) => indexReady && isQueryValid && activeFields.length > 0,
);


// Export reducer
export default searchSlice.reducer;
