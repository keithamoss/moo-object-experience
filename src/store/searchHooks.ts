/**
 * Search-specific hooks
 */

import { useAppSelector } from './hooks';
import {
	selectActiveSearchFields,
	selectCanSearch,
	selectHasResults,
	selectIndexReady,
	selectIsQueryValid,
	selectResultCount,
	selectSearchQuery,
	selectSearchResults,
} from './searchSlice';

export const useSearchQuery = () => useAppSelector(selectSearchQuery);
export const useSearchResults = () => useAppSelector(selectSearchResults);
export const useActiveSearchFields = () => useAppSelector(selectActiveSearchFields);
export const useIndexReady = () => useAppSelector(selectIndexReady);
export const useResultCount = () => useAppSelector(selectResultCount);
export const useHasResults = () => useAppSelector(selectHasResults);
export const useIsQueryValid = () => useAppSelector(selectIsQueryValid);
export const useCanSearch = () => useAppSelector(selectCanSearch);
