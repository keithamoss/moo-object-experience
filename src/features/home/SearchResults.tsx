/**
 * SearchResults component
 * List of search result cards with scores and metadata
 * Responsive grid layout with empty state
 */

import { Center, Grid, Image, Loader, Overlay, Paper, Stack, Text, Title } from '@mantine/core';
import { useMemo } from 'react';
import ResultCard from '../../components/ResultCard';
import { OBJECT_FIELDS } from '../../constants/objectFields';
import type { SearchResult } from '../../services/search';
import type { ObjectData } from '../../types/metadata';
import noResultsImage from './NoResultsImage.svg';

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
					.filter((obj) => obj[OBJECT_FIELDS.IDENTIFIER] !== undefined)
					.map((obj) => [obj[OBJECT_FIELDS.IDENTIFIER] as string, obj]),
			),
		[objects],
	);

	// Show empty state if no results
	if (results.length === 0 && query.trim().length > 0) {
		return (
			<Stack align="center" mt={60} mb={60} gap="lg" data-testid="no-results">
				<Image src={noResultsImage} maw={280} mx="auto" />
				<Title order={2} size="h3" ta="center">
					No results found
				</Title>
				<Text size="md" ta="center" maw={420}>
					Nothing matched <strong>"{query}"</strong> — try fewer words, check your spelling, or enable more search
					fields.
				</Text>
			</Stack>
		);
	}

	// Don't show anything if no query
	if (query.trim().length === 0) {
		return null;
	}

	return (
		<Paper withBorder p="md" radius="md" mt="lg" style={{ position: 'relative' }}>
			{/* Loading overlay */}
			{isSearching && (
				<Overlay backgroundOpacity={0.8} color="#fff" zIndex={1} style={{ pointerEvents: 'none' }} radius="md">
					<Center h="100%">
						<Loader role="progressbar" aria-label="Searching..." />
					</Center>
				</Overlay>
			)}

			<Title order={6} mb="sm" fw={700} size="xs" tt="uppercase">
				{results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
			</Title>

			<Grid mt="xs">
				{results.map((result) => {
					const object = objectsById.get(result.id);
					if (!object) return null;

					return (
						<Grid.Col key={result.id} span={{ base: 12, md: 6 }} data-testid="result-card-grid">
							<ResultCard result={result} object={object} query={query} />
						</Grid.Col>
					);
				})}
			</Grid>
		</Paper>
	);
}
