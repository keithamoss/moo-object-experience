import { describe, expect, it } from 'vitest';
import { setQuery } from './searchSlice';
import { store } from './store';

describe('store', () => {
	it('should be defined with correct initial state', () => {
		const state = store.getState();

		expect(state).toBeDefined();
		expect(state.search).toBeDefined();
	});

	it('should handle dispatched actions', () => {
		store.dispatch(setQuery('test'));
		const state = store.getState();

		expect(state.search.query).toBe('test');
	});

	it('should have RTK Query api slice', () => {
		const state = store.getState();

		// Check that the sheetsApi slice is present
		expect(state).toHaveProperty('sheetsApi');
	});

	it('should maintain state across multiple dispatches', () => {
		store.dispatch(setQuery('first'));
		expect(store.getState().search.query).toBe('first');

		store.dispatch(setQuery('second'));
		expect(store.getState().search.query).toBe('second');
	});
});
