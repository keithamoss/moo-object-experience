/**
 * Memoized selectors for accessing normalized data from RTK Query
 * Uses selectFromResult for automatic memoization
 */

import { useGetMetadataQuery, useGetObjectsQuery } from '../store';
import { metadataAdapter, objectsAdapter } from '../store/api';
import type { MetadataField, ObjectData } from '../types/metadata';

// Create selectors once at module level
const metadataSelectors = metadataAdapter.getSelectors();
const objectsSelectors = objectsAdapter.getSelectors();

/**
 * Hook to get all metadata fields as an array
 */
export function useMetadataFields() {
  return useGetMetadataQuery(undefined, {
    selectFromResult: ({ data, ...rest }) => ({
      fields: data ? metadataSelectors.selectAll(data) : [],
      ...rest,
    }),
  });
}

/**
 * Hook to get a specific metadata field by name
 */
export function useMetadataField(fieldName: string) {
  return useGetMetadataQuery(undefined, {
    selectFromResult: ({ data, ...rest }) => ({
      field: data ? metadataSelectors.selectById(data, fieldName) : undefined,
      ...rest,
    }),
  });
}

/**
 * Hook to get all objects as an array (sorted by title)
 */
export function useObjects(metadata?: MetadataField[]) {
  return useGetObjectsQuery(metadata ?? [], {
    skip: !metadata,
    selectFromResult: ({ data, ...rest }) => ({
      objects: data ? objectsSelectors.selectAll(data) : [],
      ...rest,
    }),
  });
}

/**
 * Hook to get a specific object by ID
 */
export function useObject(objectId: string, metadata?: MetadataField[]) {
  return useGetObjectsQuery(metadata ?? [], {
    skip: !metadata,
    selectFromResult: ({ data, ...rest }) => ({
      object: data ? objectsSelectors.selectById(data, objectId) : undefined,
      ...rest,
    }),
  });
}

/**
 * Hook to get object count
 */
export function useObjectCount(metadata?: MetadataField[]) {
  return useGetObjectsQuery(metadata ?? [], {
    skip: !metadata,
    selectFromResult: ({ data, ...rest }) => ({
      count: data ? objectsSelectors.selectTotal(data) : 0,
      ...rest,
    }),
  });
}

/**
 * Hook to get a sample of objects for preview
 */
export function useObjectsSample(count: number = 5, metadata?: MetadataField[]) {
  return useGetObjectsQuery(metadata ?? [], {
    skip: !metadata,
    selectFromResult: ({ data, ...rest }) => ({
      sample: data ? objectsSelectors.selectAll(data).slice(0, count) : [],
      ...rest,
    }),
  });
}

/**
 * Hook to search/filter objects by a predicate function
 */
export function useFilteredObjects(
  predicate: (object: ObjectData) => boolean,
  metadata?: MetadataField[]
) {
  return useGetObjectsQuery(metadata ?? [], {
    skip: !metadata,
    selectFromResult: ({ data, ...rest }) => ({
      objects: data ? objectsSelectors.selectAll(data).filter(predicate) : [],
      ...rest,
    }),
  });
}
