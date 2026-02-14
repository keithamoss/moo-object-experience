/**
 * SearchResults component
 * List of search result cards with scores and metadata
 * Responsive grid layout with empty state
 */

import { Alert, Box, CircularProgress, Grid, Typography } from '@mui/material';
import { useMemo } from 'react';
import ResultCard from '../../components/ResultCard';
import type { SearchResult } from '../../services/search';
import type { ObjectData } from '../../types/metadata';

export interface SearchResultsProps {
	/** Search results with scores */
	readonly results: SearchResult[];
	/** All objects for lookup */
	readonly objects: ObjectData[];
	/** Current search query */
	readonly query: string;
	/** Whether search is currently executing */
	readonly isSearching?: boolean;
}

export default function SearchResults({ results, objects, query, isSearching = false }: SearchResultsProps) {
	// Create lookup map for objects (memoized to avoid recreation on every render)
	const objectsById = useMemo(
		() =>
			new Map<string, ObjectData>(
				objects
					.filter((obj) => obj['dcterms:identifier.moooi'] !== undefined)
					.map((obj) => [obj['dcterms:identifier.moooi'] as string, obj]),
			),
		[objects],
	);

	// Show empty state if no results
	if (results.length === 0 && query.trim().length > 0) {
		return (
			<Alert severity="info" sx={{ mt: 3 }}>
				<Typography variant="body1">
					No results found for <strong>"{query}"</strong>
				</Typography>
				<Typography variant="body2" sx={{ mt: 1 }}>
					Try adjusting your search terms or enabling more search fields.
				</Typography>
			</Alert>
		);
	}

	// Don't show anything if no query
	if (query.trim().length === 0) {
		return null;
	}

	return (
		<Box sx={{ mt: 3, position: 'relative' }}>
			{/* Loading overlay */}
			{isSearching && (
				<Box
					sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						bgcolor: 'rgba(255, 255, 255, 0.8)',
						zIndex: 1,
						pointerEvents: 'none',
					}}
				>
					<CircularProgress />
				</Box>
			)}

			<Typography variant="h6" gutterBottom>
				{results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
			</Typography>

			<Grid container spacing={2} sx={{ mt: 1, opacity: isSearching ? 0.5 : 1 }}>
				{results.map((result) => {
					const object = objectsById.get(result.id);
					if (!object) return null;

					return <ResultCard key={result.id} result={result} object={object} query={query} />;
				})}
			</Grid>
		</Box>
	);
}
