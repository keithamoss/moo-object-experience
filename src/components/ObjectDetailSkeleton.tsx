import { Box, Container, Grid, Paper, Skeleton, Stack } from '@mantine/core';
import { PageMetadata } from './PageMetadata';

/**
 * Loading skeleton for object detail page
 * Mimics the structure of the actual detail page while loading
 */
export default function ObjectDetailSkeleton() {
	return (
		<Container size="lg" mt="lg" mb="xl" data-testid="object-detail-skeleton">
			<PageMetadata title="Loading... | Museum Object Experience" description="Loading object details" />

			{/* Breadcrumbs skeleton */}
			<Box mb="md">
				<Skeleton height={24} width={300} />
			</Box>

			{/* Page header skeleton — bare, matching the new hero layout */}
			<Stack gap={4} mb="lg">
				<Skeleton height={48} width="75%" />
				<Skeleton height={18} width="25%" />
			</Stack>

			{/* Main content: asymmetric 2-column layout */}
			<Grid gap="md" align="flex-start">
				{/* Left column skeleton */}
				<Grid.Col span={{ base: 12, md: 7 }}>
					<Stack gap="md">
						{/* Description Section skeleton */}
						<Paper withBorder p="md" radius="md">
							<Skeleton height={12} width="25%" mb="xs" />
							<Skeleton height={18} width="100%" mb="xs" />
							<Skeleton height={18} width="100%" mb="xs" />
							<Skeleton height={18} width="100%" mb="xs" />
							<Skeleton height={18} width="100%" mb="xs" />
							<Skeleton height={18} width="100%" mb="xs" />
							<Skeleton height={18} width="100%" mb="xs" />
							<Skeleton height={18} width="55%" />
						</Paper>

						{/* Images Section skeleton */}
						<Paper withBorder p="md" radius="md">
							<Skeleton height={12} width="18%" mb="xs" />
							<Skeleton height={400} width="100%" radius="sm" />
						</Paper>
					</Stack>
				</Grid.Col>

				{/* Right column skeleton */}
				<Grid.Col span={{ base: 12, md: 5 }}>
					<Paper withBorder p="md" radius="md">
						<Skeleton height={12} width="30%" mb="md" />

						{/* Metadata fields — widths vary to simulate real data */}
						{(
							[
								['30%', '75%'],
								['45%', '55%'],
								['25%', '90%'],
								['40%', '60%'],
								['30%', '80%'],
								['50%', '45%'],
								['35%', '70%'],
								['40%', '85%'],
								['28%', '65%'],
							] as const
						).map(([labelW, valueW], i) => (
							<Box
								key={`${labelW}-${valueW}`}
								py="xs"
								style={{ borderTop: i > 0 ? '1px solid var(--mantine-color-gray-2)' : 'none' }}
							>
								<Skeleton height={14} width={labelW} mb={6} />
								<Skeleton height={18} width={valueW} />
							</Box>
						))}
					</Paper>
				</Grid.Col>
			</Grid>
		</Container>
	);
}
