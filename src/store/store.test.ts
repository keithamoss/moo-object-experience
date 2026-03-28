import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestStore } from '../test-utils/test-helpers';
import { sheetsApi } from './api';
import { setQuery } from './searchSlice';

describe('store', () => {
	it('should be defined with correct initial state', () => {
		const store = createTestStore();
		const state = store.getState();

		expect(state).toBeDefined();
		expect(state.search).toBeDefined();
	});

	it('should have sheetsApi RTK Query slice', () => {
		const store = createTestStore();
		const state = store.getState();

		expect(state).toHaveProperty('sheetsApi');
	});

	it('should handle dispatched search actions in isolation', () => {
		const store = createTestStore();

		store.dispatch(setQuery('first'));
		expect(store.getState().search.query).toBe('first');

		store.dispatch(setQuery('second'));
		expect(store.getState().search.query).toBe('second');
	});

	it('should expose correct search initial state', () => {
		const store = createTestStore();
		const { search } = store.getState();

		expect(search.query).toBe('');
		expect(search.results).toEqual([]);
		expect(search.indexReady).toBe(false);
	});

	describe('RTK Query integration', () => {
		it('should fulfill getMetadata query via middleware (happy path)', async () => {
			const store = createTestStore();

			const promise = store.dispatch(sheetsApi.endpoints.getMetadata.initiate());
			const result = await promise;

			expect(result.status).toBe('fulfilled');
		});

		it('should populate sheetsApi cache after getMetadata fulfills', async () => {
			const store = createTestStore();

			await store.dispatch(sheetsApi.endpoints.getMetadata.initiate());

			await waitFor(() => {
				const queries = store.getState().sheetsApi.queries;
				const entry = Object.values(queries)[0];
				expect(entry?.status).toBe('fulfilled');
			});
		});

		it('should fulfill getObjects query given a valid metadata schema', async () => {
			const store = createTestStore();

			// Fetch metadata first to obtain the schema required by getObjects
			const metadataResult = await store.dispatch(sheetsApi.endpoints.getMetadata.initiate());

			if (metadataResult.status !== 'fulfilled' || !metadataResult.data) {
				throw new Error('Metadata fetch failed unexpectedly');
			}

			const { metadataAdapter } = await import('./api');
			const schema = metadataAdapter.getSelectors().selectAll(metadataResult.data);

			const objectsResult = await store.dispatch(sheetsApi.endpoints.getObjects.initiate(schema));

			expect(objectsResult.status).toBe('fulfilled');
		});
	});
});
