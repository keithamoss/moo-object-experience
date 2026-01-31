/**
 * Custom hook to fetch metadata and objects in sequence
 * This handles the dependency where objects need the metadata schema
 */

import { useMemo } from 'react';
import { useGetMetadataQuery, useGetObjectsQuery } from '../store';
import { metadataAdapter, objectsAdapter } from '../store/api';

/**
 * Fetches metadata first, then uses it to fetch objects
 * Returns combined loading/error states and both datasets
 * 
 * Standard version (compatible with current React patterns)
 */
export function useData() {
  // Fetch metadata first
  const {
    data: metadataState,
    isLoading: isLoadingMetadata,
    error: metadataError,
  } = useGetMetadataQuery();

  // Extract metadata array from normalized state
  const metadata = useMemo(() => {
    if (!metadataState) return undefined;
    return metadataAdapter.getSelectors().selectAll(metadataState);
  }, [metadataState]);

  // Only fetch objects once we have metadata
  const {
    data: objectsState,
    isLoading: isLoadingObjects,
    error: objectsError,
  } = useGetObjectsQuery(metadata ?? [], {
    skip: !metadata, // Skip this query until metadata is available
  });

  // Extract objects array from normalized state
  const objects = useMemo(() => {
    if (!objectsState) return undefined;
    return objectsAdapter.getSelectors().selectAll(objectsState);
  }, [objectsState]);

  return {
    metadata,
    objects,
    isLoading: isLoadingMetadata || isLoadingObjects,
    error: metadataError || objectsError,
    isSuccess: !!metadata && !!objects,
  };
}
