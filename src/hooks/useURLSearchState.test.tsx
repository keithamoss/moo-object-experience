import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_SEARCHABLE_FIELD_NAMES } from '../config/searchConfig';
import { setActiveFields, setQuery } from '../store/searchSlice';
import { AllTheProviders, createTestStore } from '../test-utils/test-helpers';
import { useURLSearchState } from './useURLSearchState';

describe('useURLSearchState', () => {
	let store: ReturnType<typeof createTestStore>;

	beforeEach(() => {
		store = createTestStore();
	});

	it('should dispatch setQuery when URL query changes', () => {
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		const searchParams = new URLSearchParams('q=stone');

		renderHook(() => useURLSearchState(searchParams, '', ALL_SEARCHABLE_FIELD_NAMES), {
			wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
		});

		expect(dispatchSpy).toHaveBeenCalledWith(setQuery('stone'));
	});

	it('should not dispatch when query unchanged', () => {
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		const searchParams = new URLSearchParams('q=stone');

		renderHook(() => useURLSearchState(searchParams, 'stone', ALL_SEARCHABLE_FIELD_NAMES), {
			wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
		});

		// Should not dispatch since query is the same
		expect(dispatchSpy).not.toHaveBeenCalledWith(setQuery('stone'));
	});

	it('should dispatch setActiveFields when fields change', () => {
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		const searchParams = new URLSearchParams('fields=dcterms:title');

		renderHook(() => useURLSearchState(searchParams, '', ALL_SEARCHABLE_FIELD_NAMES), {
			wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
		});

		expect(dispatchSpy).toHaveBeenCalledWith(setActiveFields(['dcterms:title']));
	});

	it('should handle empty query parameter', () => {
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		const searchParams = new URLSearchParams();

		renderHook(() => useURLSearchState(searchParams, 'existing', ALL_SEARCHABLE_FIELD_NAMES), {
			wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
		});

		expect(dispatchSpy).toHaveBeenCalledWith(setQuery(''));
	});

	it('should use all fields when fields param is null', () => {
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		const searchParams = new URLSearchParams();

		renderHook(() => useURLSearchState(searchParams, '', []), {
			wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
		});

		expect(dispatchSpy).toHaveBeenCalledWith(setActiveFields(ALL_SEARCHABLE_FIELD_NAMES));
	});

	it('should not dispatch when fields are unchanged', () => {
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		const searchParams = new URLSearchParams();
		const currentFields = ALL_SEARCHABLE_FIELD_NAMES;

		renderHook(() => useURLSearchState(searchParams, '', currentFields), {
			wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
		});

		// Should not dispatch setActiveFields since fields are the same
		const setFieldsCalls = dispatchSpy.mock.calls.filter((call) => call[0].type === setActiveFields.type);
		expect(setFieldsCalls.length).toBe(0);
	});
});
