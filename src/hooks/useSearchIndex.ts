/**
 * Custom hook for building and managing the search index
 * Handles initialization of MiniSearch index and terms index when objects are loaded
 */

import { useEffect } from 'react';
import { searchService } from '../services/search';
import { termsService } from '../services/terms';
import { useAppDispatch } from '../store/hooks';
import { setIndexReady } from '../store/searchSlice';
import type { ObjectData } from '../types/metadata';

/**
 * Builds search index and terms index when objects are loaded
 * Dispatches setIndexReady(true) when complete
 *
 * @param objects - Array of objects to index
 */
export function useSearchIndex(objects: ObjectData[]): void {
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (objects && objects.length > 0) {
			// Build both search index and terms index
			searchService.buildIndex(objects);
			termsService.buildIndex(objects);
			dispatch(setIndexReady(true));
		}
	}, [objects, dispatch]);
}
