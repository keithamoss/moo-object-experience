import {
	Alert,
	Badge,
	Box,
	Container,
	Divider,
	Image,
	List,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import logoUrl from '../../assets/logo.svg';
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

			{/* Hero: full-bleed, two-column layout */}
			<Box className={classes.heroWrapper}>
				<Container size="lg">
					<div className={classes.inner}>
						<div className={classes.content}>
							<Title order={1} className={classes.title} mb="xs">
								We're creating the Westralian Museum of Objects of Interest
							</Title>
							{/* <Title order={2} className={classes.subtitle} mb="lg" fw={300}>
								Object Experience
							</Title>
							<Text c="dimmed" className={classes.description} mb="lg">
								Search and discover objects in the collection
							</Text> */}
							<List
								mt="md"
								mb="md"
								spacing="sm"
								size="sm"
								icon={
									<ThemeIcon size={20} radius="xl">
										<IconCheck size={12} stroke={1.5} />
									</ThemeIcon>
								}
							>
								<List.Item>
									Do you delight in spotting a manhole cover with the logo of the long-gone State Electricity
									Commission?
								</List.Item>
								<List.Item>
									Do you wonder what it was like to live under the tyranny of Western Australia's Dried Fruits Board?
								</List.Item>
								<List.Item>Do you daydream about travelling in back in time to ride the first bendy bus?</List.Item>
								<List.Item>
									Do you whisper 'Westralia shall be free!' to yourself when meeting with the Commonwealth?
								</List.Item>
							</List>
							<Text className={classes.description} mb="xs" fw={700} size="xl">
								Do we have the museum for you.
							</Text>
							<Badge size="xl" variant="outline" mb="lg">
								Live teaser
							</Badge>
						</div>
						<Image src={logoUrl} alt="Westralian People's Museum" className={classes.image} />
					</div>
				</Container>
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
