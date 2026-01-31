import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Container, IconButton, Paper, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

export default function ObjectDetailPage() {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Helmet>
        <title>Object {id} | Westralian People's Museum</title>
      </Helmet>

      <Box sx={{ mb: 2 }}>
        <IconButton onClick={handleBack} aria-label="back to home">
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Object Detail
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          ID: {id}
        </Typography>
        {slug && (
          <Typography variant="body2" color="text.secondary" paragraph>
            Slug: {slug}
          </Typography>
        )}
        <Typography variant="body1" sx={{ mt: 3 }}>
          Object details will be displayed here once data integration is complete.
        </Typography>
      </Paper>
    </Container>
  );
}
