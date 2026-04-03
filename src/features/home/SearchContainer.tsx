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

import { useForm } from '@mantine/form';
import { useCallback, useEffect, useState } from 'react';
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

	// @mantine/form owns the uncommitted (live) query value
	const form = useForm({ initialValues: { query: '' } });
	const [isSearching, setIsSearching] = useState(false);

	// Redux search state (committed search)
	const committedQuery = useAppSelector(selectSearchQuery);
	const results = useAppSelector(selectSearchResults);
	const activeFields = useAppSelector(selectActiveSearchFields);

	// Sync URL to Redux using custom hook
	useURLSearchState(searchParams, committedQuery, activeFields);

	// Build search index when objects are loaded
	useSearchIndex(objects);

	// Update form query when URL changes (browser back/forward)
	// biome-ignore lint/correctness/useExhaustiveDependencies: form.setFieldValue is excluded intentionally — in Mantine v9 it is recreated every render (unstable reference), so including it would cause an infinite update loop. searchParams is the only meaningful trigger.
	useEffect(() => {
		const urlQuery = searchParams.get(URL_PARAMS.QUERY) || '';
		form.setFieldValue('query', urlQuery);
	}, [searchParams]);

	// Clear loading state when search completes
	// biome-ignore lint/correctness/useExhaustiveDependencies: We intentionally depend on committedQuery to trigger when search completes
	useEffect(() => {
		setIsSearching(false);
	}, [committedQuery]);

	const updateURL = useCallback(
		(newQuery?: string, newFields?: SearchableFieldName[]) => {
			const params = new URLSearchParams();

			const queryToUse = newQuery ?? form.values.query;
			if (queryToUse.trim()) {
				params.set(URL_PARAMS.QUERY, queryToUse);
			}

			const fieldsToUse = newFields ?? activeFields;
			if (!areAllFieldsSelected(fieldsToUse)) {
				params.set(URL_PARAMS.FIELDS, fieldsToUse.join(','));
			}

			setSearchParams(params);
		},
		[form.values.query, activeFields, setSearchParams],
	);

	// Handlers
	// biome-ignore lint/correctness/useExhaustiveDependencies: form.setFieldValue excluded — Mantine v9 recreates it every render, making it an unstable dep
	const handleQueryChange = useCallback((newQuery: string) => {
		form.setFieldValue('query', newQuery);
	}, []);

	const handleCommit = useCallback(() => {
		const trimmedQuery = form.values.query.trim();
		if (trimmedQuery) {
			if (trimmedQuery !== committedQuery) {
				setIsSearching(true);
			}
			updateURL(trimmedQuery, activeFields);
		} else {
			setSearchParams(new URLSearchParams());
		}
	}, [form.values.query, committedQuery, activeFields, updateURL, setSearchParams]);

	const handleCommitWithQuery = useCallback(
		(query: string) => {
			const trimmedQuery = query.trim();
			if (trimmedQuery) {
				form.setFieldValue('query', trimmedQuery);
				if (trimmedQuery !== committedQuery) {
					setIsSearching(true);
				}
				updateURL(trimmedQuery, activeFields);
			} else {
				setSearchParams(new URLSearchParams());
			}
		},
		[committedQuery, activeFields, updateURL, setSearchParams, form.setFieldValue],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: form.reset excluded — Mantine v9 recreates it every render, making it an unstable dep
	const handleClear = useCallback(() => {
		form.reset();
		setSearchParams(new URLSearchParams());
	}, [setSearchParams]);

	const handleToggleField = useCallback(
		(fieldName: SearchableFieldName) => {
			const fieldsParam = searchParams.get(URL_PARAMS.FIELDS);
			const currentFields = parseFieldsFromURL(fieldsParam);

			const newFields = currentFields.includes(fieldName)
				? currentFields.filter((f) => f !== fieldName)
				: [...currentFields, fieldName];

			const trimmedQuery = committedQuery.trim();

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
			<SearchBar
				query={form.values.query}
				onQueryChange={handleQueryChange}
				onCommit={handleCommit}
				onCommitWithQuery={handleCommitWithQuery}
				onClear={handleClear}
				disabled={disabled}
				metadataFields={metadata}
				activeFields={activeFields}
				onToggleField={handleToggleField}
			/>

			<SearchResults results={results} objects={objects} query={committedQuery} isSearching={isSearching} />
		</>
	);
}
