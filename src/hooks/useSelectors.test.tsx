import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { mockMappingsResponse } from '../../e2e/fixtures/sheetsData';
import { toFieldKey } from '../constants/objectFields';
import { AllTheProviders, createTestStore } from '../test-utils/test-helpers';
import { useObject } from './useSelectors';

function makeWrapper() {
	const store = createTestStore();
	return ({ children }: PropsWithChildren) => <AllTheProviders store={store}>{children}</AllTheProviders>;
}

describe('useSelectors skip behaviour', () => {
	it('does not fetch objects when metadata is an empty array', async () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch');
		const wrapper = makeWrapper();

		renderHook(() => useObject('OBJ-001', []), { wrapper });

		await waitFor(() => {
			expect(fetchSpy).toHaveBeenCalledTimes(0);
		});

		fetchSpy.mockRestore();
	});

	it('fetches objects when metadata is provided', async () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch');
		const wrapper = makeWrapper();
		const metadata = mockMappingsResponse.values.slice(1).map((row) => ({
			field: toFieldKey(row[0]),
			namespace: row[1] ?? '',
			label: row[2] ?? '',
			applicableCollections: row[3] ?? '',
			required: row[4] ?? '',
			purpose: row[5] ?? '',
			fieldTypeAndControls: row[6] ?? '',
			example: row[7] ?? '',
		}));

		renderHook(() => useObject('OBJ-001', metadata), { wrapper });

		await waitFor(() => {
			expect(fetchSpy).toHaveBeenCalledTimes(1);
		});

		expect(fetchSpy.mock.calls[0][0]).toContain('/values/Museum');
		fetchSpy.mockRestore();
	});
});
