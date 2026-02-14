/**
 * Store exports for easy importing
 */

// Components
export { ErrorBoundary } from '../components/ErrorBoundary';
// Custom hooks
export { useData } from '../hooks/useData';
export {
	useFilteredObjects,
	useMetadataField,
	useMetadataFields,
	useObject,
	useObjectCount,
	useObjects,
	useObjectsSample,
} from '../hooks/useSelectors';
// RTK Query API
// Entity adapters (for custom selectors if needed)
export { metadataAdapter, objectsAdapter, sheetsApi, useGetMetadataQuery, useGetObjectsQuery } from './api';
// Hooks
export { useAppDispatch, useAppSelector } from './hooks';
// Search hooks
export {
	useActiveSearchFields,
	useCanSearch,
	useHasResults,
	useIndexReady,
	useIsQueryValid,
	useResultCount,
	useSearchQuery,
	useSearchResults,
} from './searchHooks';
// Search actions
export { clearSearch, resetSearch, setActiveFields, setIndexReady, setQuery, toggleSearchField } from './searchSlice';
export type { AppDispatch, RootState } from './store';
// Store
export { store } from './store';
