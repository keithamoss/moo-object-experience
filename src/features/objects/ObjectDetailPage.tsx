import { Alert, Box, Container, Grid, Image, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { IconLinkOff } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs';
import InvalidObjectPage from '../../components/InvalidObjectPage';
import NotFoundPage from '../../components/NotFoundPage';
import ObjectDetailSkeleton from '../../components/ObjectDetailSkeleton';
import { PageMetadata } from '../../components/PageMetadata';
import { useMetadataFields, useObject } from '../../store';
import { useAppSelector } from '../../store/hooks';
import { selectSearchQuery } from '../../store/searchSlice';
import { getErrorMessage } from '../../utils/errorUtils';
import { buildSearchURL } from '../../utils/urlUtils';
import { FieldValue } from './FieldValue';
import classes from './ObjectDetailPage.module.css';
import { extractObjectDisplayData } from './useObjectDisplay';

export default function ObjectDetailPage() {
	const { id } = useParams<{ id: string; slug?: string }>();
	const [searchParams] = useSearchParams();
	const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());

	// Get current search query from Redux for breadcrumb link
	const searchQuery = useAppSelector(selectSearchQuery);

	// Decode the ID from the URL (in case it was URL-encoded)
	const decodedId = id ? decodeURIComponent(id) : '';

	// Scroll to top when navigating to a new object
	// biome-ignore lint/correctness/useExhaustiveDependencies: We intentionally trigger this effect when decodedId changes to scroll to top on navigation
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [decodedId]);

	// Fetch metadata first (required for objects query)
	const {
		fields: metadata,
		isLoading: isLoadingMetadata,
		isFetching: isFetchingMetadata,
		isError: isErrorMetadata,
		error: metadataError,
	} = useMetadataFields();

	// Only fetch object if we have valid ID and metadata is loaded
	const hasMetadata = metadata && metadata.length > 0;
	const shouldFetchObject = id !== undefined && hasMetadata;

	// Fetch the object from the store
	const {
		object,
		isLoading: isLoadingObject,
		isFetching: isFetchingObject,
		isSuccess: isSuccessObject,
		isError: isErrorObject,
		error: objectError,
	} = useObject(decodedId, shouldFetchObject ? metadata : undefined);

	// Extract display data (must be called before conditional returns)
	const { title, identifier, description, identifierLabel, descriptionLabel, imageUrls, fieldsToDisplay } =
		extractObjectDisplayData({
			object,
			metadata,
		});

	const handleImageError = (idx: number) => {
		setBrokenImages((prev) => new Set(prev).add(idx));
	};

	// Consolidate all loading checks
	const isLoading = isLoadingMetadata || isFetchingMetadata || isLoadingObject || isFetchingObject;

	// Return 404 if ID is missing
	if (!id) {
		return <NotFoundPage />;
	}

	// Show error before the loading guard so a known failure (e.g. schema drift)
	// surfaces immediately rather than waiting behind a skeleton.
	const dataError = isErrorMetadata ? metadataError : isErrorObject ? objectError : null;
	if (dataError) {
		return (
			<Container size="lg" mt="lg" mb="lg">
				<Alert color="red" title="Error loading object">
					<Text size="sm">{getErrorMessage(dataError)}</Text>
				</Alert>
			</Container>
		);
	}

	// Show loading skeleton while data is being fetched
	if (isLoading) {
		return <ObjectDetailSkeleton />;
	}

	// Only show 404 if the query has completed successfully but returned no object
	if (isSuccessObject && !object) {
		return <NotFoundPage />;
	}

	// Wait for object to load
	if (!object) {
		return <ObjectDetailSkeleton />;
	}

	// Defensive check: identifier should always exist (validation upstream should prevent this)
	if (!identifier) {
		return <InvalidObjectPage reason="missing-identifier" objectId={id} />;
	}

	// Build breadcrumb navigation
	const breadcrumbItems: Array<{ label: string; path?: string }> = [{ label: 'Home', path: '/' }];

	// Add search results breadcrumb if we have a search query
	if (searchQuery) {
		breadcrumbItems.push({
			label: 'Search Results',
			path: buildSearchURL(searchQuery, searchParams),
		});
	}

	// Current object is the last breadcrumb (not clickable)
	breadcrumbItems.push({
		label: title || identifier,
	});

	return (
		<Container size="lg" mt="lg" mb="xl">
			<PageMetadata title={`${title} | Museum Object Experience`} />

			{/* Breadcrumb navigation */}
			<Breadcrumbs items={breadcrumbItems} />

			{/* Page header — bare, no Paper */}
			<Stack gap={4} mb="lg">
				<Title order={1}>{title}</Title>
				<Text size="sm" c="dimmed">
					{identifierLabel}: {identifier}
				</Text>
			</Stack>

			{/* Main content: asymmetric 2-column layout */}
			<Grid gap="md" align="flex-start">
				{/* Left column: Description and Images (wider) */}
				<Grid.Col span={{ base: 12, md: 7 }}>
					<Stack gap="md">
						{/* Description Section */}
						{description && (
							<Paper withBorder p="md" radius="md">
								<Text fw={700} size="xs" tt="uppercase" c="dimmed" mb="xs">
									{descriptionLabel}
								</Text>
								<Text style={{ whiteSpace: 'pre-line' }}>{description}</Text>
							</Paper>
						)}

						{/* Images Section */}
						{imageUrls.length > 0 && (
							<Paper withBorder p="md" radius="md">
								<Text fw={700} size="xs" tt="uppercase" c="dimmed" mb="xs">
									Images
								</Text>
								<Stack gap="md">
									{imageUrls.map((url, idx) => (
										<Box key={url}>
											{brokenImages.has(idx) ? (
												<Stack
													align="center"
													justify="center"
													style={{
														width: '100%',
														minHeight: 200,
														backgroundColor: 'var(--mantine-color-gray-1)',
														borderRadius: 'var(--mantine-radius-sm)',
														padding: 'var(--mantine-spacing-md)',
													}}
												>
													<IconLinkOff size={48} color="var(--mantine-color-gray-4)" />
													<Text size="sm" c="dimmed" ta="center">
														Image unavailable
													</Text>
												</Stack>
											) : (
												<Image
													src={url}
													alt={`${title} ${idx + 1}`}
													loading="lazy"
													onError={() => handleImageError(idx)}
													radius="sm"
												/>
											)}
										</Box>
									))}
								</Stack>
							</Paper>
						)}
					</Stack>
				</Grid.Col>

				{/* Right column: Metadata sidebar (narrower, sticky) */}
				<Grid.Col span={{ base: 12, md: 5 }} className={classes.sidebar}>
					<Paper withBorder p="md" radius="md" data-testid="metadata-section">
						<Text fw={700} size="xs" tt="uppercase" c="dimmed" mb="md">
							Metadata
						</Text>

						{fieldsToDisplay.length === 0 ? (
							<Text size="sm" c="dimmed">
								No additional metadata available
							</Text>
						) : (
							<Table variant="vertical" layout="fixed" verticalSpacing="xs" horizontalSpacing="sm">
								<Table.Tbody>
									{fieldsToDisplay.map((field) => (
										<Table.Tr key={field.field}>
											<Table.Th w={140}>{field.label}</Table.Th>
											<Table.Td>
												<FieldValue value={object[field.field]} fieldTypeAndControls={field.fieldTypeAndControls} />
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						)}
					</Paper>
				</Grid.Col>
			</Grid>
		</Container>
	);
}
