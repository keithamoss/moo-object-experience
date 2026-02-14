/**
 * Custom hook for syncing URL parameters to Redux search state
 * Handles unidirectional data flow: URL → Redux
 */

import { useEffect } from 'react';
import type { SearchableFieldName } from '../config/searchConfig';
import { URL_PARAMS } from '../constants/urlParams';
import { useAppDispatch } from '../store/hooks';
import { setActiveFields, setQuery } from '../store/searchSlice';
import { areFieldArraysEqual, parseFieldsFromURL } from '../utils/searchUtils';

/**
 * Syncs URL search parameters to Redux state
 * Only dispatches when values actually change to prevent unnecessary re-renders
 *
 * Why comparison-based dispatch?
 * ==============================
 * We compare new URL values to existing Redux state before dispatching to avoid:
 * 1. Unnecessary Redux updates when URL hasn't changed
 * 2. Re-renders of components subscribed to Redux state
 * 3. Potential infinite loops if dispatching triggers side effects
 *
 * The comparison ensures we only dispatch when the URL actually changes,
 * not when this effect re-runs due to other dependency changes.
 *
 * @param searchParams - URLSearchParams from React Router
 * @param committedQuery - Current query in Redux (for comparison)
 * @param activeFields - Current active fields in Redux (for comparison)
 */
export function useURLSearchState(
	searchParams: URLSearchParams,
	committedQuery: string,
	activeFields: SearchableFieldName[],
) {
	const dispatch = useAppDispatch();

	useEffect(() => {
		const urlQuery = searchParams.get(URL_PARAMS.QUERY) || '';
		const fieldsParam = searchParams.get(URL_PARAMS.FIELDS);

		// Parse fields from URL
		const fieldsToUse = parseFieldsFromURL(fieldsParam);

		// Only dispatch if values actually changed (optimization to prevent unnecessary re-renders)
		if (urlQuery !== committedQuery) {
			dispatch(setQuery(urlQuery));
		}

		// Only dispatch if fields changed
		if (!areFieldArraysEqual(fieldsToUse, activeFields)) {
			dispatch(setActiveFields(fieldsToUse));
		}
	}, [searchParams, dispatch, committedQuery, activeFields]);
}
