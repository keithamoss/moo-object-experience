/**
 * Tests for SearchBar component
 */

import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_SEARCHABLE_FIELD_NAMES } from '../../config/searchConfig';
import { termsService } from '../../services/terms';
import { createMockObjectData, renderWithProviders, screen, userEvent } from '../../test-utils/test-helpers';
import type { MetadataField } from '../../types/metadata';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
	const mockMetadataFields: MetadataField[] = [
		{
			field: 'dcterms:title',
			namespace: 'Dublin Core',
			label: 'Title',
			applicableCollections: 'All',
			required: 'Mandatory',
			purpose: 'Object title',
			fieldTypeAndControls: 'Free text',
			example: 'Stone Axe',
		},
		{
			field: 'dcterms:description',
			namespace: 'Dublin Core',
			label: 'Description',
			applicableCollections: 'All',
			required: 'Mandatory',
			purpose: 'Object description',
			fieldTypeAndControls: 'Free text',
			example: 'An ancient tool',
		},
	];

	const defaultProps = {
		query: '',
		onQueryChange: vi.fn(),
		onCommit: vi.fn(),
		onClear: vi.fn(),
		disabled: false,
		committedQuery: '',
		metadataFields: mockMetadataFields,
		activeFields: ALL_SEARCHABLE_FIELD_NAMES,
		onToggleField: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();

		// Build terms index for autocomplete suggestions
		const mockObjects = [
			createMockObjectData({
				'dcterms:title': 'Ancient Stone Bowl',
				'dcterms:description': 'A beautiful stone artifact',
			}),
			createMockObjectData({
				'dcterms:title': 'Modern Steel Sculpture',
				'dcterms:description': 'Contemporary steel art piece',
			}),
		];
		termsService.buildIndex(mockObjects);
	});

	describe('basic rendering', () => {
		it('should render search input', () => {
			renderWithProviders(<SearchBar {...defaultProps} />);

			expect(screen.getByLabelText('Search the collection')).toBeInTheDocument();
		});

		it('should display the current query', () => {
			renderWithProviders(<SearchBar {...defaultProps} query="stone" />);

			const input = screen.getByLabelText('Search the collection') as HTMLInputElement;
			expect(input.value).toBe('stone');
		});

		it('should render clear button when query is not empty', () => {
			renderWithProviders(<SearchBar {...defaultProps} query="test" />);

			expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
		});

		it('should not render clear button when query is empty', () => {
			renderWithProviders(<SearchBar {...defaultProps} query="" />);

			expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
		});

		it('should render filter button', () => {
			renderWithProviders(<SearchBar {...defaultProps} />);

			expect(screen.getByLabelText('Toggle search filters')).toBeInTheDocument();
		});
	});

	describe('user interactions', () => {
		it('should call onQueryChange when typing', async () => {
			const onQueryChange = vi.fn();
			const user = userEvent.setup();

			renderWithProviders(<SearchBar {...defaultProps} onQueryChange={onQueryChange} />);

			const input = screen.getByLabelText('Search the collection');
			await user.type(input, 'test');

			expect(onQueryChange).toHaveBeenCalled();
		});

		it('should call onCommit when Enter is pressed', async () => {
			const onCommit = vi.fn();
			const user = userEvent.setup();

			renderWithProviders(<SearchBar {...defaultProps} query="test" onCommit={onCommit} />);

			const input = screen.getByLabelText('Search the collection');
			await user.click(input);
			await user.keyboard('{Enter}');

			expect(onCommit).toHaveBeenCalledTimes(1);
		});

		it('should call onClear when Escape is pressed', async () => {
			const onClear = vi.fn();
			const user = userEvent.setup();

			renderWithProviders(<SearchBar {...defaultProps} query="test" onClear={onClear} />);

			const input = screen.getByLabelText('Search the collection');
			await user.click(input);
			await user.keyboard('{Escape}');

			expect(onClear).toHaveBeenCalledTimes(1);
		});

		it('should call onClear when clear button is clicked', async () => {
			const onClear = vi.fn();
			const user = userEvent.setup();

			renderWithProviders(<SearchBar {...defaultProps} query="test" onClear={onClear} />);

			const clearButton = screen.getByLabelText('Clear search');
			await user.click(clearButton);

			expect(onClear).toHaveBeenCalledTimes(1);
		});

		it('should call onCommit on blur if query changed', async () => {
			const onCommit = vi.fn();
			const user = userEvent.setup();

			renderWithProviders(
				<>
					<SearchBar {...defaultProps} query="new query" committedQuery="old query" onCommit={onCommit} />
					<button type="button">Outside</button>
				</>,
			);

			const input = screen.getByLabelText('Search the collection');
			await user.click(input);

			// Focus something else to trigger blur
			const outsideButton = screen.getByText('Outside');
			await user.click(outsideButton);

			expect(onCommit).toHaveBeenCalledTimes(1);
		});

		it('should NOT call onCommit on blur if query has not changed', async () => {
			const onCommit = vi.fn();
			const user = userEvent.setup();

			renderWithProviders(
				<>
					<SearchBar {...defaultProps} query="same query" committedQuery="same query" onCommit={onCommit} />
					<button type="button">Outside</button>
				</>,
			);

			const input = screen.getByLabelText('Search the collection');
			await user.click(input);

			// Focus something else to trigger blur
			const outsideButton = screen.getByText('Outside');
			await user.click(outsideButton);

			expect(onCommit).not.toHaveBeenCalled();
		});
	});

	describe('double history entry bug fix', () => {
		it('should call onCommit only ONCE when Enter is pressed (not twice on blur)', async () => {
			const onCommit = vi.fn();
			const user = userEvent.setup();

			renderWithProviders(
				<>
					<SearchBar {...defaultProps} query="test query" committedQuery="old query" onCommit={onCommit} />
					<button type="button">Outside</button>
				</>,
			);

			const input = screen.getByLabelText('Search the collection');
			await user.click(input);

			// Press Enter (which will blur the input internally)
			await user.keyboard('{Enter}');

			// Wait for any async blur handlers to fire
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 150));
			});

			// onCommit should have been called exactly once (not twice)
			expect(onCommit).toHaveBeenCalledTimes(1);
		});

		it('should call onCommit only ONCE when selecting suggestion with keyboard', async () => {
			const onCommit = vi.fn();
			const onQueryChange = vi.fn();
			const user = userEvent.setup();

			renderWithProviders(
				<>
					<SearchBar
						{...defaultProps}
						query="sto"
						committedQuery=""
						onCommit={onCommit}
						onQueryChange={onQueryChange}
					/>
					<button type="button">Outside</button>
				</>,
			);

			const input = screen.getByLabelText('Search the collection');
			await user.click(input);

			// Type to trigger suggestions (this should show "stone" in dropdown)
			await user.keyboard('ne');

			// Wait a bit for suggestions to appear
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100));
			});

			// Press Enter to select suggestion (this internally calls handleChange then handleKeyDown)
			await user.keyboard('{Enter}');

			// Wait for any async blur handlers to fire
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 150));
			});

			// onCommit should have been called exactly once (not twice)
			// This is the critical test for the bug fix
			expect(onCommit).toHaveBeenCalledTimes(1);
		});

		it('should handle multiple Enter presses correctly', async () => {
			const onCommit = vi.fn();
			const user = userEvent.setup();

			renderWithProviders(<SearchBar {...defaultProps} query="test" committedQuery="" onCommit={onCommit} />);

			const input = screen.getByLabelText('Search the collection');

			// First Enter press
			await user.click(input);
			await user.keyboard('{Enter}');

			// Wait for the justCommittedRef flag to reset (100ms + buffer)
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 150));
			});

			// Second Enter press (need to refocus since blur happened)
			await user.click(input);
			await user.keyboard('{Enter}');

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 150));
			});

			// Each Enter should trigger one commit (2 total)
			expect(onCommit).toHaveBeenCalledTimes(2);
		});
	});

	describe('filters', () => {
		it('should toggle filters when filter button is clicked', async () => {
			const user = userEvent.setup();

			const { container } = renderWithProviders(<SearchBar {...defaultProps} />);

			const filterButton = screen.getByLabelText('Toggle search filters');

			// Filters should be collapsed initially (height: 0)
			const collapseElement = container.querySelector('.MuiCollapse-root');
			expect(collapseElement).toHaveClass('MuiCollapse-hidden');

			// Click to show filters
			await user.click(filterButton);

			// Wait for collapse animation
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 300));
			});

			expect(collapseElement).not.toHaveClass('MuiCollapse-hidden');

			// Click to hide filters
			await user.click(filterButton);

			// Wait for collapse animation
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 300));
			});

			expect(collapseElement).toHaveClass('MuiCollapse-hidden');
		});

		it('should call onToggleField when a filter checkbox is toggled', async () => {
			const onToggleField = vi.fn();
			const user = userEvent.setup();

			renderWithProviders(<SearchBar {...defaultProps} onToggleField={onToggleField} />);

			// Open filters
			const filterButton = screen.getByLabelText('Toggle search filters');
			await user.click(filterButton);

			// Find and click a field checkbox
			const titleCheckbox = screen.getByLabelText(/Search in Title/i);
			await user.click(titleCheckbox);

			expect(onToggleField).toHaveBeenCalledWith('dcterms:title');
		});
	});

	describe('disabled state', () => {
		it('should disable input when disabled prop is true', () => {
			renderWithProviders(<SearchBar {...defaultProps} disabled />);

			const input = screen.getByLabelText('Search the collection') as HTMLInputElement;
			expect(input).toBeDisabled();
		});

		it('should disable buttons when disabled prop is true', () => {
			renderWithProviders(<SearchBar {...defaultProps} query="test" disabled />);

			expect(screen.getByLabelText('Clear search')).toBeDisabled();
			expect(screen.getByLabelText('Toggle search filters')).toBeDisabled();
		});
	});
});
