import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OBJECT_FIELDS } from '../../constants/objectFields';
import { renderWithProviders } from '../../test-utils/test-helpers';
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
		renderWithProviders(
			<SearchContainer metadata={[searchableField]} objects={testObjects} />,
		);

		expect(screen.getByTestId('search-box')).toBeInTheDocument();
	});

	it('should render a disabled search input when disabled prop is true', () => {
		renderWithProviders(
			<SearchContainer metadata={[searchableField]} objects={testObjects} disabled />,
		);

		const input = screen.getByTestId('search-box');
		expect(input).toBeDisabled();
	});

	it('should accept typed input', () => {
		renderWithProviders(
			<SearchContainer metadata={[searchableField]} objects={testObjects} />,
		);

		const input = screen.getByTestId('search-box');
		fireEvent.change(input, { target: { value: 'stone' } });

		expect(input).toHaveValue('stone');
	});

	it('should show search results after pressing Enter on a query', async () => {
		renderWithProviders(
			<SearchContainer metadata={[searchableField]} objects={testObjects} />,
		);

		const input = screen.getByTestId('search-box');
		fireEvent.change(input, { target: { value: 'stone' } });
		fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

		// Results heading should appear — "Aboriginal Stone Axe" matches "stone"
		await waitFor(() =>
			expect(screen.getByText(/result/i)).toBeInTheDocument(),
		);
	});

	it('should show an empty state when a query matches nothing', async () => {
		renderWithProviders(
			<SearchContainer metadata={[searchableField]} objects={testObjects} />,
		);

		const input = screen.getByTestId('search-box');
		fireEvent.change(input, { target: { value: 'zzznomatch' } });
		fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

		await waitFor(() =>
			expect(screen.getByRole('alert')).toBeInTheDocument(),
		);
		expect(screen.getByText(/no results found/i)).toBeInTheDocument();
	});
});
