import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Footer from './components/Footer';
import LoadingIndicator from './components/LoadingIndicator';
import { ErrorBoundary } from './store';

function App(): React.ReactElement {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
			<AppBar position="static">
				<Toolbar>
					<Typography
						variant="h6"
						component={Link}
						to="/"
						aria-label="Museum Object Experience - Go to homepage"
						sx={{
							flexGrow: 1,
							textDecoration: 'none',
							color: 'inherit',
							'&:hover': {
								opacity: 0.8,
							},
						}}
					>
						Museum Object Experience
					</Typography>
				</Toolbar>
			</AppBar>
			<Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
				<ErrorBoundary>
					<Suspense fallback={<LoadingIndicator message="Loading..." />}>
						<Outlet />
					</Suspense>
				</ErrorBoundary>
			</Container>
			<Footer />
		</Box>
	);
}

export default App;
