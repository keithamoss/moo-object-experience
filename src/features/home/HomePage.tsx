import { Alert, Box, Container, Divider, List, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import LoadingIndicator from '../../components/LoadingIndicator';
import { PageMetadata } from '../../components/PageMetadata';
import { OBJECT_FIELDS } from '../../constants/objectFields';
import { useData } from '../../hooks/useData';
import { useAppSelector } from '../../store/hooks';
import { selectSearchQuery } from '../../store/searchSlice';
import { getErrorMessage } from '../../utils/errorUtils';
import classes from './HomePage.module.css';
import SearchContainer from './SearchContainer';

export default function HomePage() {
	const { metadata, objects, isLoading, error, isSuccess } = useData();
	const searchQuery = useAppSelector(selectSearchQuery);

	const isSearchDisabled = !isSuccess || !objects || objects.length === 0;

	// Dynamic page title based on search state
	const pageTitle = searchQuery.trim()
		? `Search: ${searchQuery} - Museum Object Experience`
		: 'Museum Object Experience';

	return (
		<Box data-testid="home-page" data-loading={isLoading} data-ready={isSuccess}>
			<PageMetadata
				title={pageTitle}
				description="Search and discover objects in the Westralian People's Museum of Objects of Interest and Reference Library"
			/>

			{/* Hero: full-bleed, big typography */}
			<Box className={classes.heroWrapper}>
				<Title order={1} className={classes.title} mb="md">
					Westralian People's Museum
				</Title>
				<Title order={2} className={classes.subtitle} mb="lg" fw={300}>
					Object Experience
				</Title>
				<Text c="dimmed" className={classes.description}>
					Search and discover objects in the collection
				</Text>
			</Box>

			{/* Search + content: constrained to readable width */}
			<Container size="lg" mt="xl" mb="xl">
				{/* Search UI */}
				{metadata && objects && <SearchContainer metadata={metadata} objects={objects} disabled={isSearchDisabled} />}

				{/* Loading State */}
				{isLoading ? (
					<Box mt="lg">
						<LoadingIndicator message="Loading collection data..." />
					</Box>
				) : null}

				{/* Error State */}
				{error ? (
					<Box mt="lg">
						<Alert color="red" icon={<IconAlertCircle size={16} />} title="Failed to load collection data">
							<Text size="sm">{getErrorMessage(error)}</Text>
						</Alert>
					</Box>
				) : null}

				{/* Success State - Show Metrics (hidden during active search) */}
				{isSuccess && metadata && objects && !searchQuery ? (
					<Box mt="lg">
						<Paper withBorder p="md" radius="md">
							<Text fw={700} size="xs" tt="uppercase" mb="md">
								Collection
							</Text>
							<SimpleGrid cols={2}>
								<Stack gap={0}>
									<Text fw={700} size="xlreml">
										{objects.length}
									</Text>
									<Text size="xs" c="dimmed">
										Objects
									</Text>
								</Stack>
								<Stack gap={0}>
									<Text fw={700} size="xlreml">
										{metadata.length}
									</Text>
									<Text size="xs" c="dimmed">
										Metadata fields
									</Text>
								</Stack>
							</SimpleGrid>

							{objects.length > 0 && (
								<>
									<Divider my="md" />
									<Text fw={700} size="xs" tt="uppercase" mb="xs">
										Sample objects
									</Text>
									<List size="sm">
										{objects
											.filter((obj) => obj[OBJECT_FIELDS.TITLE])
											.slice(0, 5)
											.map((obj) => (
												<List.Item key={obj[OBJECT_FIELDS.IDENTIFIER] as string}>
													{obj[OBJECT_FIELDS.TITLE] as string}
												</List.Item>
											))}
									</List>
								</>
							)}
						</Paper>
					</Box>
				) : null}
			</Container>
		</Box>
	);
}
