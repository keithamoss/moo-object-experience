/**
 * SearchBar component
 * Text input with type-ahead suggestions, search and clear buttons
 * Syncs with URL query parameter (?q=)
 */

import { ActionIcon, Autocomplete, Box, Collapse, Group, Indicator, Paper, Text } from '@mantine/core';
import { IconFilter, IconX } from '@tabler/icons-react';
import { useMemo, useRef, useState } from 'react';
import KeyboardKey from '../../components/KeyboardKey';
import type { SearchableFieldName } from '../../config/searchConfig';
import { termsService } from '../../services/terms';
import type { MetadataField } from '../../types/metadata';
import { areAllFieldsSelected } from '../../utils/searchUtils';
import SearchFilters from './SearchFilters';

export interface SearchBarProps {
	/** Current search query */
	readonly query: string;
	/** Callback when query changes */
	readonly onQueryChange: (query: string) => void;
	/** Callback when search is committed (Enter/blur) */
	readonly onCommit: () => void;
	/** Callback when search is committed with a specific query (e.g., autocomplete selection) */
	readonly onCommitWithQuery?: (query: string) => void;
	/** Callback when clear button clicked */
	readonly onClear: () => void;
	/** Whether search is disabled */
	readonly disabled?: boolean;

	/** Metadata schema for field labels */
	readonly metadataFields: MetadataField[];
	/** Currently active search fields */
	readonly activeFields: SearchableFieldName[];
	/** Callback when a field is toggled */
	readonly onToggleField: (fieldName: SearchableFieldName) => void;
}

export default function SearchBar({
	query,
	onQueryChange,
	onCommit,
	onCommitWithQuery,
	onClear,
	disabled = false,
	metadataFields,
	activeFields,
	onToggleField,
}: SearchBarProps) {
	// Memoize mobile detection (only needs to run once)
	const isMobile = useMemo(() => /iPhone|iPad|Android/i.test(navigator.userAgent), []);

	// Ref to access the input element directly
	const inputRef = useRef<HTMLInputElement>(null);

	// Tracks whether the user is navigating suggestions with arrow keys.
	// Prevents handleKeyDown Enter from committing the partial query when
	// handleOptionSubmit will commit the selected suggestion instead.
	const isNavigatingSuggestions = useRef(false);

	// State for showing/hiding filters
	const [showFilters, setShowFilters] = useState(false);

	// State for suggestions
	const [suggestions, setSuggestions] = useState<string[]>([]);

	// Get suggestions based on current query
	const updateSuggestions = (inputValue: string) => {
		if (!inputValue || inputValue.length < 2) {
			setSuggestions([]);
			return;
		}

		const words = inputValue.split(/\s+/);
		const lastWord = words[words.length - 1];

		if (lastWord.length >= 2) {
			const newSuggestions = termsService.getSuggestions(lastWord, 10);
			setSuggestions(newSuggestions);
		} else {
			setSuggestions([]);
		}
	};

	const handleChange = (newValue: string) => {
		onQueryChange(newValue);
		updateSuggestions(newValue);
	};

	const handleOptionSubmit = (value: string) => {
		isNavigatingSuggestions.current = false;

		// Replace the last word with the selected suggestion
		const words = query.split(/\s+/).filter((w) => w.length > 0);
		let updatedQuery = '';

		if (words.length > 1) {
			words[words.length - 1] = value;
			updatedQuery = words.join(' ');
		} else {
			updatedQuery = value;
		}

		setSuggestions([]);

		// Blur input to dismiss keyboard on mobile
		if (inputRef.current) {
			inputRef.current.blur();
		}

		if (onCommitWithQuery) {
			onCommitWithQuery(updatedQuery);
		} else {
			onQueryChange(updatedQuery);
			setTimeout(() => {
				onCommit();
			}, 0);
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			if (suggestions.length > 0) {
				isNavigatingSuggestions.current = true;
			}
		} else if (event.key === 'Enter') {
			if (isNavigatingSuggestions.current) {
				// An option is highlighted — let handleOptionSubmit commit the selection.
				isNavigatingSuggestions.current = false;
				return;
			}
			event.preventDefault();
			if (inputRef.current) {
				inputRef.current.blur();
			}
			onCommit();
			setSuggestions([]);
		} else if (event.key === 'Escape') {
			isNavigatingSuggestions.current = false;
			onClear();
			setSuggestions([]);
		}
	};

	const handleToggleFilters = () => {
		setShowFilters(!showFilters);
	};

	const showClearButton = query.length > 0;
	const hasCustomFields = !areAllFieldsSelected(activeFields);

	return (
		<Paper shadow="sm" withBorder p="md" radius="md" mb="md">
			<Autocomplete
				value={query}
				onChange={handleChange}
				onOptionSubmit={handleOptionSubmit}
				data={suggestions}
				filter={({ options }) => options}
				disabled={disabled}
				label="Search the collection"
				styles={{ label: { marginBottom: 8 } }}
				size="xl"
				ref={inputRef}
				onKeyDown={handleKeyDown}
				data-testid="search-box"
				data-ready={!disabled}
				inputMode="search"
				autoComplete="off"
				spellCheck={false}
				comboboxProps={{ position: 'bottom-start' }}
				mb="sm"
				rightSection={
					<Group gap={4} wrap="nowrap" pr={32}>
						<Indicator disabled={!hasCustomFields} color="red" size={8} offset={4}>
							<ActionIcon
								aria-label="Toggle search filters"
								aria-expanded={showFilters}
								onClick={handleToggleFilters}
								variant="filled"
								radius="xl"
								size="lg"
								disabled={disabled}
								color="brand"
							>
								<IconFilter size={18} stroke={1.5} />
							</ActionIcon>
						</Indicator>
						{showClearButton && (
							<ActionIcon
								aria-label="Clear search"
								onClick={onClear}
								variant="filled"
								radius="xl"
								size="lg"
								disabled={disabled}
								color="gray.5"
								ml={4}
							>
								<IconX size={16} />
							</ActionIcon>
						)}
					</Group>
				}
				rightSectionWidth={showClearButton ? 64 : 36}
			/>

			{/* Keyboard shortcut hints (desktop only) */}
			{!isMobile && (
				<Box mt={4} style={{ textAlign: 'right' }}>
					<Text size="xs" c="dimmed">
						<KeyboardKey>Enter</KeyboardKey> to search · <KeyboardKey>Esc</KeyboardKey> to clear
					</Text>
				</Box>
			)}

			{/* Inline search filters */}
			<Collapse expanded={showFilters} data-testid="filter-collapse">
				<Box mt="md">
					<SearchFilters
						metadataFields={metadataFields}
						activeFields={activeFields}
						onToggleField={onToggleField}
						disabled={disabled}
						inline
					/>
				</Box>
			</Collapse>
		</Paper>
	);
}
