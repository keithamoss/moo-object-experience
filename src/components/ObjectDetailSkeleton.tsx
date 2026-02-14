import { Box, Container, Divider, Grid, Paper, Skeleton } from '@mui/material';

/**
 * Loading skeleton for object detail page
 * Mimics the structure of the actual detail page while loading
 */
export default function ObjectDetailSkeleton() {
	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
			{/* Breadcrumbs skeleton */}
			<Box sx={{ mb: 2 }}>
				<Skeleton variant="text" width={300} height={24} />
			</Box>

			{/* Hero Section skeleton */}
			<Paper elevation={2} sx={{ p: 3, mb: 3 }}>
				<Skeleton variant="text" width="70%" height={48} sx={{ mb: 1 }} />
				<Skeleton variant="text" width="40%" height={24} />
			</Paper>

			{/* Main Content: 2-column layout */}
			<Grid container spacing={3}>
				{/* Left Column skeleton */}
				<Grid item xs={12} md={6}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
						{/* Description Section skeleton */}
						<Paper elevation={2} sx={{ p: 3 }}>
							<Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
							<Skeleton variant="text" width="100%" />
							<Skeleton variant="text" width="100%" />
							<Skeleton variant="text" width="90%" />
							<Skeleton variant="text" width="95%" />
						</Paper>

						{/* Images Section skeleton */}
						<Paper elevation={2} sx={{ p: 3 }}>
							<Skeleton variant="text" width="20%" height={32} sx={{ mb: 2 }} />
							<Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 1 }} />
						</Paper>
					</Box>
				</Grid>

				{/* Right Column skeleton */}
				<Grid item xs={12} md={6}>
					<Paper elevation={2} sx={{ p: 3 }}>
						<Skeleton variant="text" width="30%" height={32} sx={{ mb: 1 }} />
						<Divider sx={{ mb: 2 }} />

						{/* Metadata fields skeleton */}
						{[1, 2, 3, 4, 5].map((i) => (
							<Box key={i} sx={{ py: 1.5, borderBottom: i < 5 ? '1px solid' : 'none', borderColor: 'divider' }}>
								<Skeleton variant="text" width="35%" height={20} sx={{ mb: 0.5 }} />
								<Skeleton variant="text" width="60%" height={24} />
							</Box>
						))}
					</Paper>
				</Grid>
			</Grid>
		</Container>
	);
}
