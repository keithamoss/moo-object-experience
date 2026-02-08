/**
 * Store exports for easy importing
 */

// Store
export { store } from './store';
export type { AppDispatch, RootState } from './store';

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
export {
	clearSearch,
	resetSearch,
	setActiveFields,
	setIndexReady,
	setQuery,
	toggleSearchField,
} from './searchSlice';

// RTK Query API
export { sheetsApi, useGetMetadataQuery, useGetObjectsQuery } from './api';

// Entity adapters (for custom selectors if needed)
export { metadataAdapter, objectsAdapter } from './api';

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

// Components
export { ErrorBoundary } from '../components/ErrorBoundary';
