/**
 * SearchFilters component
 * Dynamically generated checkboxes for searchable fields
 * Syncs with URL query parameters
 */

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { SEARCHABLE_FIELDS, type SearchableFieldName } from '../../config/searchConfig';
import type { MetadataField } from '../../types/metadata';

export interface SearchFiltersProps {
	/** Metadata schema to get field labels */
	metadataFields: MetadataField[];
	/** Currently active search fields */
	activeFields: SearchableFieldName[];
	/** Callback when a field is toggled */
	onToggleField: (fieldName: SearchableFieldName) => void;
	/** Whether filters are disabled */
	disabled?: boolean;
	/** Whether to display inline (without Accordion wrapper) */
	inline?: boolean;
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
			<FormGroup>
				{SEARCHABLE_FIELDS.map((field) => {
					const isActive = activeFields.includes(field.fieldName);
					const label = fieldLabels.get(field.fieldName) || field.fieldName;

					return (
						<FormControlLabel
							key={field.fieldName}
							control={
								<Checkbox
									checked={isActive}
									onChange={() => onToggleField(field.fieldName)}
									disabled={disabled}
									inputProps={{
										'aria-label': `Search in ${label}`,
									}}
								/>
							}
							label={label}
						/>
					);
				})}
			</FormGroup>

			{activeFields.length === 0 && (
				<Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
					Select at least one field to search
				</Typography>
			)}
		</>
	);

	// Inline mode: render without Accordion
	if (inline) {
		return (
			<Box>
				<Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
					Search Fields {selectionState.displayText}
				</Typography>
				{filterControls}
			</Box>
		);
	}

	// Standard mode: render with Accordion
	return (
		<Accordion elevation={1} defaultExpanded={false}>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				aria-controls="search-filters-content"
				id="search-filters-header"
			>
				<Typography>Search Fields {selectionState.displayText}</Typography>
			</AccordionSummary>
			<AccordionDetails>{filterControls}</AccordionDetails>
		</Accordion>
	);
}
