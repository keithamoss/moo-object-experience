/**
 * SearchBar component
 * Text input with type-ahead suggestions, search and clear buttons
 * Syncs with URL query parameter (?q=)
 */

import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Autocomplete,
  Badge,
  Box,
  Collapse,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
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
	/** Current committed query from URL (for blur comparison) */
	readonly committedQuery?: string;
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
	committedQuery = '',
	metadataFields,
	activeFields,
	onToggleField,
}: SearchBarProps) {
	// Memoize mobile detection (only needs to run once)
	const isMobile = useMemo(() => /iPhone|iPad|Android/i.test(navigator.userAgent), []);

	// Ref to access the input element directly
	const inputRef = useRef<HTMLInputElement>(null);

	// Ref to track if we just committed (to avoid double-commit on blur)
	const justCommittedRef = useRef(false);

	// Ref to track if user is navigating suggestions with keyboard
	const isNavigatingSuggestionsRef = useRef(false);

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

		// Get the last word being typed (for multi-word queries)
		const words = inputValue.split(/\s+/);
		const lastWord = words[words.length - 1];

		if (lastWord.length >= 2) {
			const newSuggestions = termsService.getSuggestions(lastWord, 10);
			setSuggestions(newSuggestions);
		} else {
			setSuggestions([]);
		}
	};

	const handleInputChange = (_event: React.SyntheticEvent, newValue: string, reason: string) => {
		// Only update on input, not on selection
		if (reason === 'input') {
			onQueryChange(newValue);
			updateSuggestions(newValue);
			// Reset navigation flag when user types
			isNavigatingSuggestionsRef.current = false;
		}
	};

	const handleChange = (_event: React.SyntheticEvent, newValue: string | null, reason: string) => {
		// When a suggestion is selected (clicked or via keyboard)
		if (newValue !== null && reason === 'selectOption') {
			// Replace the last word with the selected suggestion
			// Filter out empty strings from split to handle trailing whitespace
			const words = query.split(/\s+/).filter((w) => w.length > 0);
			let updatedQuery = '';

			if (words.length > 1) {
				// Multi-word query: replace just the last word
				words[words.length - 1] = newValue;
				updatedQuery = words.join(' ');
			} else {
				// Single word or empty: use the selected value directly
				updatedQuery = newValue;
			}

			// Clear suggestions and navigation flag
			setSuggestions([]);
			isNavigatingSuggestionsRef.current = false;

			// Mark that we're committing (prevents double-commit if Enter was pressed)
			justCommittedRef.current = true;

			// Commit the search with the updated query
			if (onCommitWithQuery) {
				onCommitWithQuery(updatedQuery);
			} else {
				// Fallback to old behavior if callback not provided
				onQueryChange(updatedQuery);
				setTimeout(() => {
					onCommit();
				}, 0);
			}

			// Reset the flag after a short delay
			setTimeout(() => {
				justCommittedRef.current = false;
			}, 100);
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		// Track when user navigates suggestions with arrow keys
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			if (suggestions.length > 0) {
				isNavigatingSuggestionsRef.current = true;
			}
			// Don't preventDefault - let Autocomplete handle arrow navigation
		} else if (event.key === 'Enter') {
			event.preventDefault(); // Prevent form submission

			// If user is navigating suggestions with keyboard, let Autocomplete's onChange handle it
			// This prevents double-commit when selecting with ArrowDown + Enter
			if (isNavigatingSuggestionsRef.current && suggestions.length > 0) {
				// Mark that we're committing to prevent handleBlur from also committing
				justCommittedRef.current = true;
				// onChange will fire with the selected value
				// Don't reset isNavigatingSuggestionsRef here - let onChange do it
				// Reset the just committed flag after a short delay
				setTimeout(() => {
					justCommittedRef.current = false;
				}, 100);
				return;
			}

			// Mark that we're committing via Enter
			justCommittedRef.current = true;
			// Blur to dismiss keyboard on mobile
			if (inputRef.current) {
				inputRef.current.blur();
			}
			onCommit();
			setSuggestions([]);
			isNavigatingSuggestionsRef.current = false;
			// Reset the flag after a short delay
			setTimeout(() => {
				justCommittedRef.current = false;
			}, 100);
		} else if (event.key === 'Escape') {
			onClear();
			setSuggestions([]);
			isNavigatingSuggestionsRef.current = false;
		}
	};

	const handleBlur = () => {
		// Don't commit on blur if we just committed via Enter
		if (justCommittedRef.current) {
			setSuggestions([]);
			isNavigatingSuggestionsRef.current = false;
			return;
		}

		// Only commit if query actually changed from committed value
		if (query.trim() !== committedQuery) {
			onCommit();
		}
		// Clear suggestions and navigation flag on blur
		setSuggestions([]);
		isNavigatingSuggestionsRef.current = false;
	};

	const handleToggleFilters = () => {
		setShowFilters(!showFilters);
	};

	const showClearButton = query.length > 0;
	const hasCustomFields = !areAllFieldsSelected(activeFields);

	return (
		<Paper elevation={2} sx={{ p: 2, mb: 3 }}>
			<Autocomplete
				freeSolo
				disableClearable
				options={suggestions}
				inputValue={query}
				onInputChange={handleInputChange}
				onChange={handleChange}
				disabled={disabled}
				filterOptions={(x) => x} // Don't filter - we handle filtering
				renderInput={(params) => (
					<TextField
						{...params}
						fullWidth
						label="Search"
						placeholder="Search the collection..."
						variant="outlined"
						inputRef={inputRef}
						onBlur={handleBlur}
						inputProps={{
							...params.inputProps,
							'aria-label': 'Search the collection',
							enterKeyHint: 'search', // Mobile keyboard shows "Search" button
							spellCheck: false,
							autoComplete: 'off',
						}}
						InputProps={{
							...params.InputProps,
							endAdornment: (
								<>
									{params.InputProps.endAdornment}
									{/* Filter button */}
									<InputAdornment position="end">
										<IconButton
											aria-label="Toggle search filters"
											onClick={handleToggleFilters}
											edge="end"
											size="small"
											disabled={disabled}
											color={showFilters ? 'primary' : 'default'}
										>
											<Badge
												variant="dot"
												color="error"
												invisible={!hasCustomFields}
												sx={{ '& .MuiBadge-badge': { right: 3, top: 3 } }}
											>
												<FilterListIcon />
											</Badge>
										</IconButton>
									</InputAdornment>
									{/* Clear button (always available when there's text) */}
									{showClearButton && (
										<InputAdornment position="end">
											<IconButton
												aria-label="Clear search"
												onClick={onClear}
												edge="end"
												size="small"
												disabled={disabled}
											>
												<ClearIcon />
											</IconButton>
										</InputAdornment>
									)}
								</>
							),
						}}
					/>
				)}
				onKeyDown={handleKeyDown}
				componentsProps={{
					popper: {
						placement: 'bottom-start',
					},
				}}
			/>

			{/* Keyboard shortcut hints (desktop only) */}
			{!isMobile && (
				<Box sx={{ mt: 0.5, textAlign: 'right' }}>
					<Typography variant="caption" color="text.secondary">
						<KeyboardKey>Enter</KeyboardKey> to search · <KeyboardKey>Esc</KeyboardKey> to clear
					</Typography>
				</Box>
			)}

			{/* Inline search filters */}
			<Collapse in={showFilters}>
				<Box sx={{ mt: 2 }}>
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
