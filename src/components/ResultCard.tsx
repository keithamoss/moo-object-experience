/**
 * ResultCard component
 * Displays a single search result with metadata
 */

import { Parallax } from '@gfazioli/mantine-parallax';
import { Card, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { OBJECT_FIELDS } from '../constants/objectFields';
import type { SearchResult } from '../services/search';
import type { ObjectData } from '../types/metadata';
import { highlightSearchTerms } from '../utils/highlightText';
import { generateObjectUrl } from '../utils/urlUtils';
import classes from './ResultCard.module.css';

export interface ResultCardProps {
	/** Search result with score and ID */
	readonly result: SearchResult;
	/** Object data for display */
	readonly object: ObjectData;
	/** Search query for highlighting (optional) */
	readonly query?: string;
}

/**
 * Maximum number of lines to show for description before truncating
 */
const DESCRIPTION_LINE_CLAMP = 3;

/**
 * Extract common object fields with defaults
 */
function extractObjectFields(object: ObjectData): {
	title: string;
	description: string;
	identifier: string;
	creator: string;
} {
	return {
		title: (object[OBJECT_FIELDS.TITLE] as string) || 'Untitled',
		description: (object[OBJECT_FIELDS.DESCRIPTION] as string) || '',
		identifier: (object[OBJECT_FIELDS.IDENTIFIER] as string) || '',
		creator: (object[OBJECT_FIELDS.CREATOR] as string) || '',
	};
}

export default function ResultCard({ object, query = '' }: ResultCardProps) {
	const { title, description, identifier, creator } = extractObjectFields(object);

	// Highlighted versions
	const highlightedTitle = highlightSearchTerms(title, query);
	const highlightedDescription = highlightSearchTerms(description, query);
	const highlightedCreator = highlightSearchTerms(creator, query);

	const url = identifier
		? (() => {
				try {
					return generateObjectUrl(identifier, title);
				} catch {
					return null;
				}
			})()
		: null;

	return (
		<Parallax className={classes.parallax} lightEffect lightOverlay lightIntensity={0.08} hoverScale={1.03} radius="md">
			<Card
				data-testid="result-card"
				withBorder
				shadow="sm"
				padding="md"
				className={classes.card}
				{...(url ? ({ component: Link, to: url } as object) : {})}
			>
				<Card.Section inheritPadding pt="md" pb="sm" mb="sm">
					<Title order={3} size="h6" mb={4}>
						{highlightedTitle}
					</Title>
					<Text size="xs" c="dimmed">
						{identifier}
					</Text>
				</Card.Section>
				{creator && (
					<Text size="sm" mb={4}>
						<Text component="span" size="sm" fw={600}>
							Creator:{' '}
						</Text>
						{highlightedCreator}
					</Text>
				)}
				{description && (
					<Text size="sm" lineClamp={DESCRIPTION_LINE_CLAMP} mt={4}>
						{highlightedDescription}
					</Text>
				)}
			</Card>
		</Parallax>
	);
}
