/**
 * Custom hook for building and managing the search index
 * Handles initialization of MiniSearch index when objects are loaded
 */

import { useEffect } from 'react';
import { searchService } from '../services/search';
import { useAppDispatch } from '../store/hooks';
import { setIndexReady } from '../store/searchSlice';
import type { ObjectData } from '../types/metadata';

/**
 * Builds search index when objects are loaded
 * Dispatches setIndexReady(true) when complete
 *
 * @param objects - Array of objects to index
 */
export function useSearchIndex(objects: ObjectData[]) {
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (objects && objects.length > 0) {
			searchService.buildIndex(objects);
			dispatch(setIndexReady(true));
		}
	}, [objects, dispatch]);
}
