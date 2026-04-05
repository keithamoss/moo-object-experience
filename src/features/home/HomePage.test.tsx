/**
 * Tests for HomePage
 * Covers the four conditional rendering states and page title changes.
 */

import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OBJECT_FIELDS } from '../../constants/objectFields';
import { setQuery } from '../../store/searchSlice';
import { createTestStore, renderWithProviders } from '../../test-utils/test-helpers';
import type { MetadataField, ObjectData } from '../../types/metadata';
import HomePage from './HomePage';

// vi.mock is hoisted — useData is replaced with a vi.fn() in all tests
vi.mock('../../hooks/useData');

import { useData } from '../../hooks/useData';

const mockMetadata: MetadataField[] = [
	{
		field: OBJECT_FIELDS.TITLE,
		namespace: 'Dublin Core',
		label: 'Title',
		applicableCollections: 'All',
		required: 'Mandatory',
		purpose: 'Object title',
		fieldTypeAndControls: 'Free text',
		example: 'Stone Axe',
	},
];

const mockObjects: ObjectData[] = [
	{
		[OBJECT_FIELDS.IDENTIFIER]: 'OBJ-001',
		[OBJECT_FIELDS.TITLE]: 'Aboriginal Stone Axe',
	},
	{
		[OBJECT_FIELDS.IDENTIFIER]: 'OBJ-002',
		[OBJECT_FIELDS.TITLE]: 'Metal Hammer',
	},
];

describe('HomePage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('loading state', () => {
		beforeEach(() => {
			vi.mocked(useData).mockReturnValue({
				metadata: undefined,
				objects: undefined,
				isLoading: true,
				error: undefined,
				isSuccess: false,
			});
		});

		it('should show the loading indicator', () => {
			renderWithProviders(<HomePage />);
			expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
		});

		it('should not render the search box while loading', () => {
			renderWithProviders(<HomePage />);
			expect(screen.queryByTestId('search-box')).not.toBeInTheDocument();
		});
	});

	describe('error state', () => {
		beforeEach(() => {
			vi.mocked(useData).mockReturnValue({
				metadata: undefined,
				objects: undefined,
				isLoading: false,
				error: { status: 500, error: 'Internal Server Error' },
				isSuccess: false,
			});
		});

		it('should show an alert with the error heading', () => {
			renderWithProviders(<HomePage />);
			expect(screen.getByText('Failed to load collection data')).toBeInTheDocument();
		});

		it('should include the formatted error message inside the alert', () => {
			renderWithProviders(<HomePage />);
			expect(screen.getByText(/error 500/i)).toBeInTheDocument();
		});

		it('should not render the search box when there is an error', () => {
			renderWithProviders(<HomePage />);
			expect(screen.queryByTestId('search-box')).not.toBeInTheDocument();
		});
	});

	describe('success state — no active search', () => {
		beforeEach(() => {
			vi.mocked(useData).mockReturnValue({
				metadata: mockMetadata,
				objects: mockObjects,
				isLoading: false,
				error: undefined,
				isSuccess: true,
			});
		});

		it('should show the collection metrics panel with object count', () => {
			renderWithProviders(<HomePage />);
			expect(screen.getByText('Collection')).toBeInTheDocument();
			// Object count is rendered as plain text
			expect(screen.getByText(String(mockObjects.length))).toBeInTheDocument();
		});

		it('should show the metadata field count in the metrics panel', () => {
			renderWithProviders(<HomePage />);
			expect(screen.getByText(String(mockMetadata.length))).toBeInTheDocument();
		});

		it('should list sample object titles in the metrics panel', () => {
			renderWithProviders(<HomePage />);
			expect(screen.getByText('Aboriginal Stone Axe')).toBeInTheDocument();
		});

		it('should render the search box when data is loaded', () => {
			renderWithProviders(<HomePage />);
			expect(screen.getByTestId('search-box')).toBeInTheDocument();
		});
	});

	describe('success state — active search query', () => {
		beforeEach(() => {
			vi.mocked(useData).mockReturnValue({
				metadata: mockMetadata,
				objects: mockObjects,
				isLoading: false,
				error: undefined,
				isSuccess: true,
			});
		});

		it('should hide the metrics panel when a search is active', async () => {
			// Pre-dispatch AND provide the query in the URL so useURLSearchState
			// doesn't override the Redux state with an empty URL query.
			const store = createTestStore();
			store.dispatch(setQuery('stone'));

			renderWithProviders(<HomePage />, {
				store,
				routerProps: { initialEntries: ['/?q=stone'] },
			});

			// Wait for useURLSearchState effect to settle
			await waitFor(() => expect(screen.queryByText('Collection')).not.toBeInTheDocument());
		});

		it('should still render the search box when a search is active', async () => {
			const store = createTestStore();
			store.dispatch(setQuery('stone'));

			renderWithProviders(<HomePage />, {
				store,
				routerProps: { initialEntries: ['/?q=stone'] },
			});

			await waitFor(() => expect(screen.getByTestId('search-box')).toBeInTheDocument());
		});
	});

	describe('PageMetadata title', () => {
		beforeEach(() => {
			vi.mocked(useData).mockReturnValue({
				metadata: mockMetadata,
				objects: mockObjects,
				isLoading: false,
				error: undefined,
				isSuccess: true,
			});
		});

		it('should use the default title when no search is active', () => {
			renderWithProviders(<HomePage />);
			const titleEl = document.querySelector('title');
			expect(titleEl?.textContent).toBe('Museum Object Experience');
		});

		it('should include the active query in the title when a search is committed', async () => {
			const store = createTestStore();
			store.dispatch(setQuery('pottery'));

			renderWithProviders(<HomePage />, {
				store,
				routerProps: { initialEntries: ['/?q=pottery'] },
			});

			await waitFor(() => {
				const titleEl = document.querySelector('title');
				expect(titleEl?.textContent).toContain('Search: pottery');
				expect(titleEl?.textContent).toContain('Museum Object Experience');
			});
		});
	});
});
