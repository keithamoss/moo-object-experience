import { Alert, Box, Chip, Container, Paper, Typography } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { PageMetadata } from '../../components/PageMetadata';
import { useData } from '../../hooks/useData';
import { useAppSelector } from '../../store/hooks';
import { selectSearchQuery } from '../../store/searchSlice';
import { getErrorMessage } from '../../utils/errorUtils';
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
		<Container maxWidth="md" sx={{ mt: 4 }}>
			{/* Page metadata - updates based on search query */}
			<PageMetadata
				title={pageTitle}
				description="Search and discover objects in the Westralian People's Museum of Objects of Interest and Reference Library"
			/>

			<Box sx={{ textAlign: 'center', mb: 4 }}>
				<Typography variant="h3" component="h1" gutterBottom>
					Westralian People's Museum
				</Typography>
				<Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
					Object Experience
				</Typography>
				<Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
					Search and discover objects in the collection
				</Typography>
			</Box>

			{/* Search UI - Always render to maintain consistent page metadata */}
			{metadata && objects && <SearchContainer metadata={metadata} objects={objects} disabled={isSearchDisabled} />}

			{/* Loading State */}
			{isLoading ? (
				<Box sx={{ mt: 4 }}>
					<LoadingIndicator message="Loading collection data..." />
				</Box>
			) : null}

			{/* Error State */}
			{error ? (
				<Box sx={{ mt: 4 }}>
					<Alert severity="error">
						<Typography variant="h6" gutterBottom>
							Failed to load collection data
						</Typography>
						<Typography variant="body2">{getErrorMessage(error)}</Typography>
					</Alert>
				</Box>
			) : null}

			{/* Success State - Show Metrics */}
			{isSuccess && metadata && objects ? (
				<Box sx={{ mt: 4 }}>
					<Paper elevation={1} sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							Collection Overview
						</Typography>

						{/* Metrics */}
						<Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
							<Chip label={`${objects.length} Objects`} color="primary" />
							<Chip label={`${metadata.length} Metadata Fields`} color="secondary" />
						</Box>

						{/* Sample Objects */}
						{objects.length > 0 && (
							<>
								<Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
									Sample Objects:
								</Typography>
								<Box component="ul" sx={{ mt: 1, pl: 2 }}>
									{objects.slice(0, 5).map((object) => (
										<Typography
											component="li"
											variant="body2"
											key={object['dcterms:identifier.moooi']}
											sx={{ mb: 0.5 }}
										>
											{object['dcterms:title'] || 'Untitled'}
										</Typography>
									))}
								</Box>
								{objects.length > 5 ? (
									<Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
										...and {objects.length - 5} more
									</Typography>
								) : null}
							</>
						)}
					</Paper>
				</Box>
			) : null}
		</Container>
	);
}
