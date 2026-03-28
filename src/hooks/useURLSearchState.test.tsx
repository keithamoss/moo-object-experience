import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_SEARCHABLE_FIELD_NAMES } from '../config/searchConfig';
import { OBJECT_FIELDS } from '../constants/objectFields';
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

		expect(dispatchSpy).toHaveBeenCalledWith(setActiveFields([OBJECT_FIELDS.TITLE]));
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

	it('should decode percent-encoded query parameter', () => {
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		// URLSearchParams automatically decodes percent-encoding when you call .get()
		const searchParams = new URLSearchParams('q=ancient%20egypt');

		renderHook(() => useURLSearchState(searchParams, '', ALL_SEARCHABLE_FIELD_NAMES), {
			wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
		});

		// The dispatched query should be the decoded value, not the raw encoded string
		expect(dispatchSpy).toHaveBeenCalledWith(setQuery('ancient egypt'));
	});

	it('should silently ignore invalid field names present in the URL', () => {
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		// Mix one valid field with one entirely invalid field name
		const searchParams = new URLSearchParams(`fields=${OBJECT_FIELDS.TITLE},not:a:real:field`);

		renderHook(() => useURLSearchState(searchParams, '', []), {
			wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
		});

		// Only the valid field should be dispatched; invalid ones are dropped by parseFieldsFromURL
		const setFieldsCalls = dispatchSpy.mock.calls.filter((call) => call[0].type === setActiveFields.type);
		expect(setFieldsCalls.length).toBeGreaterThan(0);
		const dispatchedFields = setFieldsCalls[0][0].payload as string[];
		expect(dispatchedFields).toContain(OBJECT_FIELDS.TITLE);
		expect(dispatchedFields).not.toContain('not:a:real:field');
	});

	it('should handle a query parameter with special characters that URLSearchParams decodes', () => {
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		// Parentheses and plus sign are common in museum object names
		const searchParams = new URLSearchParams('q=map+of+WA+(1950s)');

		renderHook(() => useURLSearchState(searchParams, '', ALL_SEARCHABLE_FIELD_NAMES), {
			wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
		});

		// URLSearchParams decodes + as space
		expect(dispatchSpy).toHaveBeenCalledWith(setQuery('map of WA (1950s)'));
	});
});
