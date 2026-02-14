import { Box, Button, Container, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
	const navigate = useNavigate();

	const handleGoHome = () => {
		navigate('/');
	};

	return (
		<Container maxWidth="md">
			<Helmet>
				<title>Page Not Found | Westralian People's Museum</title>
			</Helmet>

			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: '50vh',
					textAlign: 'center',
				}}
			>
				<Typography variant="h1" component="h1" gutterBottom>
					404
				</Typography>
				<Typography variant="h4" component="h2" gutterBottom>
					Page Not Found
				</Typography>
				<Typography variant="body1" color="text.secondary" paragraph>
					Sorry, the page you're looking for doesn't exist.
				</Typography>
				<Button variant="contained" onClick={handleGoHome} sx={{ mt: 2 }}>
					Go to Home
				</Button>
			</Box>
		</Container>
	);
}
