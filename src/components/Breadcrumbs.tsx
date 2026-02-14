import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link, Breadcrumbs as MuiBreadcrumbs, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface BreadcrumbItem {
	label: string;
	path?: string; // Optional - last item (current page) has no path
}

interface BreadcrumbsProps {
	items: BreadcrumbItem[];
}

/**
 * Breadcrumb navigation component
 * Displays navigation path with clickable links
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
	return (
		<MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
			{items.map((item, index) => {
				const isLast = index === items.length - 1;

				// Last item is not clickable (current page)
				if (isLast) {
					return (
						<Typography key={item.label} color="text.primary" sx={{ fontWeight: 500 }}>
							{item.label}
						</Typography>
					);
				}

				// All other items are links
				return (
					<Link key={item.label} component={RouterLink} to={item.path || '/'} underline="hover" color="inherit">
						{item.label}
					</Link>
				);
			})}
		</MuiBreadcrumbs>
	);
}
