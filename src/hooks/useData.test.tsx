import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { errorHandlers } from '../../e2e/mocks/handlers';
import { server } from '../../e2e/mocks/node';
import { AllTheProviders, createTestStore } from '../test-utils/test-helpers';
import { useData } from './useData';

describe('useData', () => {
	let store: ReturnType<typeof createTestStore>;
	let wrapper: ({ children }: PropsWithChildren) => React.ReactElement;

	beforeEach(() => {
		store = createTestStore();
		wrapper = ({ children }: PropsWithChildren) => <AllTheProviders store={store}>{children}</AllTheProviders>;
	});

	it('should return loading state initially', () => {
		const { result } = renderHook(() => useData(), { wrapper });

		expect(result.current.isLoading).toBe(true);
		expect(result.current.metadata).toBeUndefined();
		expect(result.current.objects).toBeUndefined();
		expect(result.current.isSuccess).toBe(false);
	});

	it('should return populated metadata and objects on successful fetch', async () => {
		const { result } = renderHook(() => useData(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 });

		expect(result.current.metadata).toBeDefined();
		expect(result.current.metadata?.length).toBeGreaterThan(0);
		expect(result.current.objects).toBeDefined();
		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeFalsy();
	});

	it('should keep objects undefined until metadata is loaded, then resolve both', async () => {
		const { result } = renderHook(() => useData(), { wrapper });

		// On first render, objects have not started loading yet
		expect(result.current.objects).toBeUndefined();

		// Once metadata arrives, objects query is unblocked and both eventually resolve
		await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 });

		expect(result.current.objects).toBeDefined();
	});

	it('should return error and no data when metadata fetch fails', async () => {
		server.use(...errorHandlers.rateLimitError);

		const { result } = renderHook(() => useData(), { wrapper });

		await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });

		expect(result.current.error).toBeDefined();
		expect(result.current.isSuccess).toBe(false);
		expect(result.current.metadata).toBeUndefined();
	});

	it('should return error when objects fetch fails after metadata succeeds', async () => {
		server.use(...errorHandlers.partialFailure);

		const { result } = renderHook(() => useData(), { wrapper });

		await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });

		expect(result.current.error).toBeDefined();
		expect(result.current.isSuccess).toBe(false);
	});

	it('should return error when museum sheet has only header row and no objects', async () => {
		server.use(...errorHandlers.emptyMuseumResponse);

		const { result } = renderHook(() => useData(), { wrapper });

		await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });

		expect(result.current.error).toBeDefined();
		expect(result.current.isSuccess).toBe(false);
	});
});
