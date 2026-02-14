/**
 * SearchContainer component
 * Encapsulates all search logic, URL state management, and search index building
 *
 * URL State Management Strategy:
 * ================================
 * This component uses a "URL as source of truth" pattern with Redux as the application state layer:
 *
 * Architecture:
 * 1. URL Parameters define shareable/bookmarkable state (?q=query&fields=title,description)
 * 2. useURLSearchState hook syncs URL → Redux (unidirectional)
 * 3. Components READ from Redux only (never directly from URL)
 * 4. User interactions WRITE to URL via updateURL()
 * 5. URL change triggers sync → Redux updates → Components re-render
 *
 * Data Flow:
 * User action → updateURL() → URL changes → useURLSearchState → Redux updates → Components read Redux
 *
 * This approach provides:
 * - Shareable URLs (copy/paste a search in progress)
 * - Browser back/forward support
 * - Clean abstraction (components don't know about URL structure)
 * - Single sync point (only useURLSearchState reads URL)
 * - No race conditions (unidirectional flow)
 *
 * State Layers:
 * - URL: Persistence layer (shareable, bookmarkable)
 * - Redux: Application state (search query, active fields, results)
 * - Local state: UI state only (uncommitted typing in localQuery)
 */

import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import type { SearchableFieldName } from '../../config/searchConfig';
import { URL_PARAMS } from '../../constants/urlParams';
import { useSearchIndex } from '../../hooks/useSearchIndex';
import { useURLSearchState } from '../../hooks/useURLSearchState';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectActiveSearchFields, selectSearchQuery, selectSearchResults } from '../../store/searchSlice';
import type { MetadataField, ObjectData } from '../../types/metadata';
import { areAllFieldsSelected, parseFieldsFromURL } from '../../utils/searchUtils';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';

export interface SearchContainerProps {
	/** Metadata schema for field labels */
	readonly metadata: MetadataField[];
	/** All objects for display */
	readonly objects: ObjectData[];
	/** Whether search is disabled */
	readonly disabled?: boolean;
}

export default function SearchContainer({ metadata, objects, disabled = false }: SearchContainerProps) {
	const _dispatch = useAppDispatch();
	const [searchParams, setSearchParams] = useSearchParams();

	// Local state for typing experience (not committed until Enter/blur)
	const [localQuery, setLocalQuery] = useState('');
	const [isSearching, setIsSearching] = useState(false);

	// Redux search state (committed search)
	const committedQuery = useAppSelector(selectSearchQuery);
	const results = useAppSelector(selectSearchResults);
	const activeFields = useAppSelector(selectActiveSearchFields);

	// Sync URL to Redux using custom hook
	// This is unidirectional: URL → Redux (no reverse sync needed)
	useURLSearchState(searchParams, committedQuery, activeFields);

	// Build search index when objects are loaded
	useSearchIndex(objects);

	// Update local query when URL changes (for committed searches)
	useEffect(() => {
		const urlQuery = searchParams.get(URL_PARAMS.QUERY) || '';
		setLocalQuery(urlQuery);
	}, [searchParams]);

	// Clear loading state when search completes (when committedQuery updates)
	useEffect(() => {
		setIsSearching(false);
	}, [

	// Consolidated URL update function (memoized to prevent recreation)
	// Builds URL params from current state and updates browser URL
	const updateURL = useCallback(
		(newQuery?: string, newFields?: SearchableFieldName[]) => {
			const params = new URLSearchParams();

			const queryToUse = newQuery ?? localQuery;
			if (queryToUse.trim()) {
				params.set(URL_PARAMS.QUERY, queryToUse);
			}

			const fieldsToUse = newFields ?? activeFields;
			// Only set fields param if not all fields (for cleaner URLs)
			// - No param = all fields selected (default)
			// - Empty string = no fields selected
			// - Comma list = specific fields selected
			if (!areAllFieldsSelected(fieldsToUse)) {
				params.set(URL_PARAMS.FIELDS, fieldsToUse.join(','));
			}

			setSearchParams(params);
		},
		[localQuery, activeFields, setSearchParams],
	);

	// Handlers - typing doesn't commit, only Enter/blur/filter-toggle commits
	const handleQueryChange = useCallback((newQuery: string) => {
		setLocalQuery(newQuery);
	}, []);

	const handleCommit = useCallback(() => {
		const trimmedQuery = localQuery.trim();

		if (trimmedQuery) {
			// Only set loading state if query actually changed
			if (trimmedQuery !== committedQuery) {
				setIsSearching(true);
			}
			updateURL(trimmedQuery, activeFields);
		} else {
			// Empty query - clear everything
			setSearchParams(new URLSearchParams());
		}
	}, [localQuery, committedQuery, activeFields, updateURL, setSearchParams]);

	const handleClear = useCallback(() => {
		setLocalQuery('');
		setSearchParams(new URLSearchParams()); // Commits empty state immediately
	}, [setSearchParams]);

	const handleToggleField = useCallback(
		(fieldName: SearchableFieldName) => {
			// Read current state from URL (source of truth) to avoid race conditions
			const fieldsParam = searchParams.get(URL_PARAMS.FIELDS);
			const currentFields = parseFieldsFromURL(fieldsParam);

			// Calculate new field list
			const newFields = currentFields.includes(fieldName)
				? currentFields.filter((f) => f !== fieldName)
				: [...currentFields, fieldName];

			// Use committed query from Redux
			const trimmedQuery = committedQuery.trim();

			// Only set loading if there's a query and fields actually changed
			const fieldsChanged =
				newFields.length !== currentFields.length || !newFields.every((field, index) => field === currentFields[index]);

			if (trimmedQuery && fieldsChanged) {
				setIsSearching(true);
			}

			updateURL(trimmedQuery, newFields);
		},
		[searchParams, committedQuery, updateURL],
	);

	return (
		<>
			{/* Page title */}
			<Helmet>
				<title>
					{committedQuery.trim() ? `Search: ${committedQuery} - Museum Object Experience` : 'Museum Object Experience'}
				</title>
			</Helmet>

			{/* Search Bar with integrated filters */}
			<SearchBar
				query={localQuery}
				onQueryChange={handleQueryChange}
				onCommit={handleCommit}
				onClear={handleClear}
				disabled={disabled}
				committedQuery={committedQuery}
				metadataFields={metadata}
				activeFields={activeFields}
				onToggleField={handleToggleField}
			/>

			{/* Search Results */}
			<SearchResults results={results} objects={objects} query={committedQuery} isSearching={isSearching} />
		</>
	);
}
