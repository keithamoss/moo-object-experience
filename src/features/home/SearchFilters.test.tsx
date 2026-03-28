import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ALL_SEARCHABLE_FIELD_NAMES, SEARCHABLE_FIELDS } from '../../config/searchConfig';
import { OBJECT_FIELDS } from '../../constants/objectFields';
import { renderWithProviders } from '../../test-utils/test-helpers';
import type { MetadataField } from '../../types/metadata';
import SearchFilters from './SearchFilters';

const mockMetadataFields: MetadataField[] = [
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
	{
		field: OBJECT_FIELDS.CREATOR,
		namespace: 'Dublin Core',
		label: 'Creator',
		applicableCollections: 'All',
		required: 'Optional',
		purpose: 'Object creator',
		fieldTypeAndControls: 'Free text',
		example: 'John Smith',
	},
];

describe('SearchFilters', () => {
	it('should render a checkbox for every searchable field', () => {
		renderWithProviders(
			<SearchFilters
				metadataFields={mockMetadataFields}
				activeFields={ALL_SEARCHABLE_FIELD_NAMES}
				onToggleField={vi.fn()}
				inline
			/>,
		);

		// SEARCHABLE_FIELDS defines the canonical list — one checkbox per field
		expect(screen.getAllByRole('checkbox')).toHaveLength(SEARCHABLE_FIELDS.length);
	});

	it('should show checkbox as checked when field is active', () => {
		renderWithProviders(
			<SearchFilters
				metadataFields={mockMetadataFields}
				activeFields={[OBJECT_FIELDS.TITLE]}
				onToggleField={vi.fn()}
				inline
			/>,
		);

		// Title label from metadata should be checked
		const titleCheckbox = screen.getByRole('checkbox', { name: /title/i });
		expect(titleCheckbox).toBeChecked();
	});

	it('should show checkbox as unchecked when field is not active', () => {
		renderWithProviders(
			<SearchFilters
				metadataFields={mockMetadataFields}
				activeFields={[OBJECT_FIELDS.TITLE]}
				onToggleField={vi.fn()}
				inline
			/>,
		);

		// Creator is not in activeFields — its checkbox must be unchecked
		const creatorCheckbox = screen.getByRole('checkbox', { name: /creator/i });
		expect(creatorCheckbox).not.toBeChecked();
	});

	it('should call onToggleField with the field name when a checkbox is clicked', () => {
		const onToggleField = vi.fn();

		renderWithProviders(
			<SearchFilters
				metadataFields={mockMetadataFields}
				activeFields={ALL_SEARCHABLE_FIELD_NAMES}
				onToggleField={onToggleField}
				inline
			/>,
		);

		fireEvent.click(screen.getByRole('checkbox', { name: /title/i }));

		expect(onToggleField).toHaveBeenCalledWith(OBJECT_FIELDS.TITLE);
	});

	it('should show "(All selected)" when all fields are active', () => {
		renderWithProviders(
			<SearchFilters
				metadataFields={mockMetadataFields}
				activeFields={ALL_SEARCHABLE_FIELD_NAMES}
				onToggleField={vi.fn()}
			/>,
		);

		expect(screen.getByText(/all selected/i)).toBeInTheDocument();
	});

	it('should show partial count when some fields are active', () => {
		renderWithProviders(
			<SearchFilters
				metadataFields={mockMetadataFields}
				activeFields={[OBJECT_FIELDS.TITLE]}
				onToggleField={vi.fn()}
			/>,
		);

		// e.g. "(1/4 selected)"
		expect(screen.getByText(/1\/\d+\s+selected/i)).toBeInTheDocument();
	});

	it('should show error message when no fields are selected', () => {
		renderWithProviders(
			<SearchFilters
				metadataFields={mockMetadataFields}
				activeFields={[]}
				onToggleField={vi.fn()}
			/>,
		);

		expect(screen.getByText(/select at least one field/i)).toBeInTheDocument();
	});

	it('should disable all checkboxes when disabled prop is true', () => {
		renderWithProviders(
			<SearchFilters
				metadataFields={mockMetadataFields}
				activeFields={ALL_SEARCHABLE_FIELD_NAMES}
				onToggleField={vi.fn()}
				disabled
				inline
			/>,
		);

		const checkboxes = screen.getAllByRole('checkbox');
		for (const checkbox of checkboxes) {
			expect(checkbox).toBeDisabled();
		}
	});

	it('should render without Accordion wrapper in inline mode', () => {
		renderWithProviders(
			<SearchFilters
				metadataFields={mockMetadataFields}
				activeFields={ALL_SEARCHABLE_FIELD_NAMES}
				onToggleField={vi.fn()}
				inline
			/>,
		);

		// Accordion renders a button element as summary; inline mode must not have one
		expect(screen.queryByRole('button', { name: /search fields/i })).not.toBeInTheDocument();

		// But the checkboxes must still be visible
		expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
	});

	it('should fall back to field name when metadata has no label for a field', () => {
		renderWithProviders(
			<SearchFilters
				metadataFields={[]} // No labels provided
				activeFields={ALL_SEARCHABLE_FIELD_NAMES}
				onToggleField={vi.fn()}
				inline
			/>,
		);

		// With no label mapping, checkboxes should still render (using raw field name as label)
		expect(screen.getAllByRole('checkbox').length).toBe(SEARCHABLE_FIELDS.length);
	});
});
