import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OBJECT_FIELDS } from '../../constants/objectFields';
import { renderWithProviders, userEvent } from '../../test-utils/test-helpers';
import type { MetadataField, ObjectData } from '../../types/metadata';
import SearchContainer from './SearchContainer';

const searchableField: MetadataField = {
	field: OBJECT_FIELDS.TITLE,
	namespace: 'Dublin Core',
	label: 'Title',
	applicableCollections: 'All',
	required: 'Mandatory',
	purpose: 'Title',
	fieldTypeAndControls: 'Free text',
	example: '',
};

const testObjects: ObjectData[] = [
	{
		[OBJECT_FIELDS.IDENTIFIER]: 'OBJ-001',
		[OBJECT_FIELDS.TITLE]: 'Aboriginal Stone Axe',
		[OBJECT_FIELDS.DESCRIPTION]: 'Ancient cutting tool',
		[OBJECT_FIELDS.CREATOR]: 'Aboriginal peoples',
	},
	{
		[OBJECT_FIELDS.IDENTIFIER]: 'OBJ-002',
		[OBJECT_FIELDS.TITLE]: 'Metal Hammer',
		[OBJECT_FIELDS.DESCRIPTION]: 'Iron workshop implement',
		[OBJECT_FIELDS.CREATOR]: 'Blacksmith',
	},
];

describe('SearchContainer', () => {
	it('should render a search input', () => {
		renderWithProviders(<SearchContainer metadata={[searchableField]} objects={testObjects} />);

		expect(screen.getByTestId('search-box')).toBeInTheDocument();
	});

	it('should render a disabled search input when disabled prop is true', () => {
		renderWithProviders(<SearchContainer metadata={[searchableField]} objects={testObjects} disabled />);

		const input = screen.getByTestId('search-box');
		expect(input).toBeDisabled();
	});

	it('should accept typed input', () => {
		renderWithProviders(<SearchContainer metadata={[searchableField]} objects={testObjects} />);

		const input = screen.getByTestId('search-box');
		fireEvent.change(input, { target: { value: 'stone' } });

		expect(input).toHaveValue('stone');
	});

	it('should show search results after pressing Enter on a query', async () => {
		renderWithProviders(<SearchContainer metadata={[searchableField]} objects={testObjects} />);

		const input = screen.getByTestId('search-box');
		fireEvent.change(input, { target: { value: 'stone' } });
		fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

		// Results heading should appear — "Aboriginal Stone Axe" matches "stone"
		await waitFor(() => expect(screen.getByText(/result/i)).toBeInTheDocument());
	});

	it('should show an empty state when a query matches nothing', async () => {
		renderWithProviders(<SearchContainer metadata={[searchableField]} objects={testObjects} />);

		const input = screen.getByTestId('search-box');
		fireEvent.change(input, { target: { value: 'zzznomatch' } });
		fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

		await waitFor(() => expect(screen.getByTestId('no-results')).toBeInTheDocument());
		expect(screen.getByText(/no results found/i)).toBeInTheDocument();
	});

	describe('clear flow', () => {
		it('should clear the search box and results when Escape is pressed', async () => {
			const user = userEvent.setup();
			renderWithProviders(<SearchContainer metadata={[searchableField]} objects={testObjects} />);

			const input = screen.getByTestId('search-box');

			// Type and commit a search
			await user.type(input, 'stone');
			await user.keyboard('{Enter}');

			// Wait for results to appear
			await waitFor(() => expect(screen.getByText(/result/i)).toBeInTheDocument());

			// Press Escape to clear
			await user.click(input);
			await user.keyboard('{Escape}');

			// Search box should be empty and results should disappear
			await waitFor(() => expect(input).toHaveValue(''));
			expect(screen.queryByText(/result/i)).not.toBeInTheDocument();
		});

		it('should clear the search box and results when the X button is clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(<SearchContainer metadata={[searchableField]} objects={testObjects} />);

			const input = screen.getByTestId('search-box');

			// Type and commit a search
			await user.type(input, 'stone');
			await user.keyboard('{Enter}');

			// Wait for results to appear
			await waitFor(() => expect(screen.getByText(/result/i)).toBeInTheDocument());

			// Click the clear (X) button
			const clearButton = screen.getByLabelText('Clear search');
			await user.click(clearButton);

			// Search box should be empty and results should disappear
			await waitFor(() => expect(input).toHaveValue(''));
			expect(screen.queryByText(/result/i)).not.toBeInTheDocument();
		});
	});

	describe('URL → form sync', () => {
		it('should pre-fill the search box from the URL on mount', async () => {
			// Render with a URL that already contains a search query
			renderWithProviders(<SearchContainer metadata={[searchableField]} objects={testObjects} />, {
				routerProps: { initialEntries: ['/?q=pottery'] },
			});

			// The useEffect syncs URL params → form field
			await waitFor(() => expect(screen.getByTestId('search-box')).toHaveValue('pottery'));
		});
	});

	describe('loading state', () => {
		it('should show a loading spinner when a filter field is toggled while a search query is active', async () => {
			const user = userEvent.setup();
			renderWithProviders(<SearchContainer metadata={[searchableField]} objects={testObjects} />);

			const input = screen.getByTestId('search-box');

			// Commit a search that returns results via the Title field
			fireEvent.change(input, { target: { value: 'stone' } });
			fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

			// Wait for results to appear
			await waitFor(() => expect(screen.getByText(/result/i)).toBeInTheDocument());

			// Open the filter panel
			await user.click(screen.getByLabelText('Toggle search filters'));

			// Wait for Mantine Collapse rAF to make checkboxes accessible
			await waitFor(() => expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0));

			// Toggle a non-Title field (e.g., last = Description index 3) so the
			// 'stone'-in-Title results remain and the loading overlay can render
			const filterCheckboxes = screen.getAllByRole('checkbox');
			await user.click(filterCheckboxes[filterCheckboxes.length - 1]);

			// The loading progressbar (inside SearchResults overlay) should appear
			await waitFor(() => expect(screen.getByRole('progressbar')).toBeInTheDocument());
		});
	});
});
