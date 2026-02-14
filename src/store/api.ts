/**
 * RTK Query API for fetching data from Google Sheets
 */

import { createEntityAdapter, type EntityState } from '@reduxjs/toolkit';
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { fetchMetadataSchema, fetchObjects } from '../services/sheetsApi';
import type { MetadataField, ObjectData } from '../types/metadata';

/**
 * Entity adapter for normalized metadata field storage
 */
export const metadataAdapter = createEntityAdapter<MetadataField, string>({
	selectId: (field) => field.field,
	sortComparer: (a, b) => a.field.localeCompare(b.field),
});

/**
 * Entity adapter for normalized objects storage
 */
export const objectsAdapter = createEntityAdapter<ObjectData, string>({
	selectId: (object) => object['dcterms:identifier.moooi'] as string,
	sortComparer: (a, b) => (a['dcterms:title'] || '').localeCompare(b['dcterms:title'] || ''),
});

export const sheetsApi = createApi({
	reducerPath: 'sheetsApi',
	baseQuery: fakeBaseQuery(),
	tagTypes: ['Metadata', 'Objects'],
	endpoints: (builder) => ({
		/**
		 * Fetch metadata schema from the Mappings sheet
		 * Returns normalized entity state
		 */
		getMetadata: builder.query<EntityState<MetadataField, string>, void>({
			queryFn: async () => {
				try {
					const schema = await fetchMetadataSchema();
					// Transform to normalized state
					const normalizedState = metadataAdapter.addMany(metadataAdapter.getInitialState(), schema);
					return { data: normalizedState };
				} catch (error) {
					return {
						error: {
							status: 'CUSTOM_ERROR',
							error: error instanceof Error ? error.message : 'Failed to fetch metadata',
						},
					};
				}
			},
			providesTags: ['Metadata'],
		}),

		/**
		 * Fetch objects from the Museum sheet
		 * Requires metadata schema as an argument
		 * Returns normalized entity state
		 */
		getObjects: builder.query<EntityState<ObjectData, string>, MetadataField[]>({
			queryFn: async (schema) => {
				try {
					const objects = await fetchObjects(schema);
					// Transform to normalized state
					const normalizedState = objectsAdapter.addMany(objectsAdapter.getInitialState(), objects);
					return { data: normalizedState };
				} catch (error) {
					return {
						error: {
							status: 'CUSTOM_ERROR',
							error: error instanceof Error ? error.message : 'Failed to fetch objects',
						},
					};
				}
			},
			providesTags: ['Objects'],
		}),
	}),
});

export const { useGetMetadataQuery, useGetObjectsQuery } = sheetsApi;
