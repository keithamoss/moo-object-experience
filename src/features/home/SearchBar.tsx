/**
 * SearchBar component
 * Text input with search and clear buttons
 * Syncs with URL query parameter (?q=)
 */

import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { Badge, Box, Collapse, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import KeyboardKey from '../../components/KeyboardKey';
import type { SearchableFieldName } from '../../config/searchConfig';
import type { MetadataField } from '../../types/metadata';
import { areAllFieldsSelected } from '../../utils/searchUtils';
import SearchFilters from './SearchFilters';

export interface SearchBarProps {
  /** Current search query */
  query: string;
  /** Callback when query changes */
  onQueryChange: (query: string) => void;
  /** Callback when search is committed (Enter/blur) */
  onCommit: () => void;
  /** Callback when clear button clicked */
  onClear: () => void;
  /** Whether search is disabled */
  disabled?: boolean;
  /** Current committed query from URL (for blur comparison) */
  committedQuery?: string;
  /** Metadata schema for field labels */
  metadataFields: MetadataField[];
  /** Currently active search fields */
  activeFields: SearchableFieldName[];
  /** Callback when a field is toggled */
  onToggleField: (fieldName: SearchableFieldName) => void;
}

export default function SearchBar({
  query,
  onQueryChange,
  onCommit,
  onClear,
  disabled = false,
  committedQuery = '',
  metadataFields,
  activeFields,
  onToggleField,
}: SearchBarProps) {
  // Memoize mobile detection (only needs to run once)
  const isMobile = useMemo(() => /iPhone|iPad|Android/i.test(navigator.userAgent), []);

  // State for showing/hiding filters
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    onQueryChange(newQuery);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur(); // Dismiss mobile keyboard
      onCommit();
    } else if (event.key === 'Escape') {
      onClear();
    }
  };

  const handleBlur = () => {
    // Only commit if query actually changed from committed value
    if (query.trim() !== committedQuery) {
      onCommit();
    }
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const showClearButton = query.length > 0;
  const hasCustomFields = !areAllFieldsSelected(activeFields);

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <TextField
        fullWidth
        label="Search"
        placeholder="Search the collection..."
        variant="outlined"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled}
        inputProps={{
          'aria-label': 'Search the collection',
          enterKeyHint: 'search', // Mobile keyboard shows "Search" button
          spellCheck: false,
          autoComplete: 'off',
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon aria-hidden="true" />
            </InputAdornment>
          ),
          endAdornment: (
            <>
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
              {/* Mobile search button (only on mobile when there's text) */}
              {isMobile && query.trim() && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Search"
                    onClick={onCommit}
                    color="primary"
                    disabled={disabled}
                    size="small"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )}
            </>
          ),
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
