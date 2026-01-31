/**
 * Store exports for easy importing
 */

// Store
export { store } from './store';
export type { AppDispatch, RootState } from './store';

// Hooks
export { useAppDispatch, useAppSelector } from './hooks';

// RTK Query API
export { sheetsApi, useGetMetadataQuery, useGetObjectsQuery } from './api';

// Entity adapters (for custom selectors if needed)
export { metadataAdapter, objectsAdapter } from './api';

// Custom hooks
export { useData } from '../hooks/useData';
export {
  useFilteredObjects, useMetadataField, useMetadataFields, useObject,
  useObjectCount, useObjects, useObjectsSample
} from '../hooks/useSelectors';

// Components
export { ErrorBoundary } from '../components/ErrorBoundary';

