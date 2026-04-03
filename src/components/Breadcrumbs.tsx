import { Anchor, Breadcrumbs as MantineBreadcrumbs, Text } from '@mantine/core';
import { Link as RouterLink } from 'react-router-dom';

interface BreadcrumbItem {
	readonly label: string;
	readonly path?: string; // Optional - last item (current page) has no path
}

interface BreadcrumbsProps {
	readonly items: BreadcrumbItem[];
}

/**
 * Breadcrumb navigation component
 * Displays navigation path with clickable links
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
	return (
		<MantineBreadcrumbs component="nav" aria-label="breadcrumb" mb="md">
			{items.map((item, index) => {
				const isLast = index === items.length - 1;

				// Last item is not clickable (current page)
				if (isLast) {
					return (
						<Text key={item.label} fw={500} component="span">
							{item.label}
						</Text>
					);
				}

				// All other items are links
				return (
					<Anchor key={item.label} component={RouterLink} to={item.path || '/'} c="inherit" underline="hover">
						{item.label}
					</Anchor>
				);
			})}
		</MantineBreadcrumbs>
	);
}
