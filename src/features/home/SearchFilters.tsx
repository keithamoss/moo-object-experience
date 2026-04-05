/**
 * SearchFilters component
 * Checkbox group for toggling searchable fields
 * Syncs with URL query parameters
 */

import { Accordion, Checkbox, Group, Text } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useMemo } from 'react';
import { SEARCHABLE_FIELDS, type SearchableFieldName } from '../../config/searchConfig';
import type { MetadataField } from '../../types/metadata';

export interface SearchFiltersProps {
	/** Metadata schema to get field labels */
	readonly metadataFields: MetadataField[];
	/** Currently active search fields */
	readonly activeFields: SearchableFieldName[];
	/** Callback when a field is toggled */
	readonly onToggleField: (fieldName: SearchableFieldName) => void;
	/** Whether filters are disabled */
	readonly disabled?: boolean;
	/** Whether to display inline (without Accordion wrapper) */
	readonly inline?: boolean;
}

export default function SearchFilters({
	metadataFields,
	activeFields,
	onToggleField,
	disabled = false,
	inline = false,
}: SearchFiltersProps) {
	// Create lookup map for metadata labels (memoized to avoid recreation on every render)
	const fieldLabels = useMemo(
		() => new Map<string, string>(metadataFields.map((field) => [field.field, field.label])),
		[metadataFields],
	);

	// Memoize selection state to avoid recomputing on every render
	const selectionState = useMemo(() => {
		const count = activeFields.length;
		const total = SEARCHABLE_FIELDS.length;
		const allSelected = count === total;
		const partialSelection = count > 0 && !allSelected;

		let displayText = '';
		if (allSelected) {
			displayText = '(All selected)';
		} else if (partialSelection) {
			displayText = `(${count}/${total} selected)`;
		}

		return {
			allSelected,
			partialSelection,
			displayText,
		};
	}, [activeFields.length]);

	// Render filter controls
	const filterControls = (
		<>
			<Checkbox.Group value={activeFields}>
				<Group gap="sm" wrap="wrap">
					{SEARCHABLE_FIELDS.map((field) => {
						const label = fieldLabels.get(field.fieldName) || field.fieldName;
						return (
							<Checkbox
								key={field.fieldName}
								value={field.fieldName}
								label={label}
								disabled={disabled}
								onChange={() => onToggleField(field.fieldName)}
								color="crimson"
							/>
						);
					})}
				</Group>
			</Checkbox.Group>

			{activeFields.length === 0 && (
				<Text size="xs" c="red" mt="xs">
					Select at least one field to search
				</Text>
			)}
		</>
	);

	// Inline mode: render without Accordion
	if (inline) {
		return (
			<div>
				<Text size="xs" fw={500} tt="uppercase" mb="xs">
					Search in
				</Text>
				{filterControls}
			</div>
		);
	}

	// Standard mode: render with Accordion
	return (
		<Accordion chevron={<IconChevronDown />} variant="contained">
			<Accordion.Item value="search-fields">
				<Accordion.Control aria-controls="search-filters-content" id="search-filters-header">
					Search Fields {selectionState.displayText}
				</Accordion.Control>
				<Accordion.Panel id="search-filters-content">{filterControls}</Accordion.Panel>
			</Accordion.Item>
		</Accordion>
	);
}
