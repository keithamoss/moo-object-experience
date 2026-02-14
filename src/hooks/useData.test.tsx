import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as storeHooks from '../store';
import { AllTheProviders, createTestStore } from '../test-utils/test-helpers';
import { useData } from './useData';

describe('useData', () => {
	let store: ReturnType<typeof createTestStore>;

	beforeEach(() => {
		store = createTestStore();
	});

	it('should return loading state initially', () => {
		// Mock the RTK Query hooks
		vi.spyOn(storeHooks, 'useGetMetadataQuery').mockReturnValue({
			data: undefined,
			isLoading: true,
			error: undefined,
		} as any);

		vi.spyOn(storeHooks, 'useGetObjectsQuery').mockReturnValue({
			data: undefined,
			isLoading: false,
			error: undefined,
		} as any);

		const { result } = renderHook(() => useData(), {
			wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
		});

		expect(result.current.isLoading).toBe(true);
		expect(result.current.metadata).toBeUndefined();
		expect(result.current.objects).toBeUndefined();
	});

	it('should skip objects query when metadata is not available', () => {
		const mockUseGetObjectsQuery = vi.fn().mockReturnValue({
			data: undefined,
			isLoading: false,
			error: undefined,
		} as any);

		vi.spyOn(storeHooks, 'useGetMetadataQuery').mockReturnValue({
			data: undefined,
			isLoading: true,
			error: undefined,
		} as any);

		vi.spyOn(storeHooks, 'useGetObjectsQuery').mockImplementation(mockUseGetObjectsQuery);

		renderHook(() => useData(), {
			wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
		});

		// Check that skip option was passed
		expect(mockUseGetObjectsQuery).toHaveBeenCalledWith([], expect.objectContaining({ skip: true }));
	});

	it('should return error when metadata fetch fails', () => {
		const error = { message: 'Failed to fetch metadata' };

		vi.spyOn(storeHooks, 'useGetMetadataQuery').mockReturnValue({
			data: undefined,
			isLoading: false,
			error,
		} as any);

		vi.spyOn(storeHooks, 'useGetObjectsQuery').mockReturnValue({
			data: undefined,
			isLoading: false,
			error: undefined,
		} as any);

		const { result } = renderHook(() => useData(), {
			wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
		});

		expect(result.current.error).toBe(error);
	});

	it('should return success when both metadata and objects are loaded', () => {
		const mockMetadata = { ids: ['m1'], entities: { m1: { field: 'dcterms:title' } } };
		const mockObjects = { ids: ['o1'], entities: { o1: { 'dcterms:title': 'Test' } } };

		vi.spyOn(storeHooks, 'useGetMetadataQuery').mockReturnValue({
			data: mockMetadata,
			isLoading: false,
			error: undefined,
		} as any);

		vi.spyOn(storeHooks, 'useGetObjectsQuery').mockReturnValue({
			data: mockObjects,
			isLoading: false,
			error: undefined,
		} as any);

		const { result } = renderHook(() => useData(), {
			wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
		});

		expect(result.current.isSuccess).toBe(true);
		expect(result.current.metadata).toBeDefined();
		expect(result.current.objects).toBeDefined();
	});
});
