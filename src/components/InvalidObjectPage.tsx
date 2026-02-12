import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface InvalidObjectPageProps {
  reason: 'missing-identifier' | 'invalid-data';
  objectId?: string;
}

/**
 * Error page shown when an object has invalid or missing required data
 * More informative than a generic 404
 */
export default function InvalidObjectPage({ reason, objectId }: InvalidObjectPageProps) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const messages = {
    'missing-identifier': {
      title: 'Invalid Object',
      description:
        'This object is missing a required identifier field and cannot be displayed. This may indicate a data quality issue.',
    },
    'invalid-data': {
      title: 'Invalid Object Data',
      description:
        'This object has incomplete or invalid data structure and cannot be displayed properly.',
    },
  };

  const { title, description } = messages[reason];

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <ErrorOutlineIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
        {objectId && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontFamily: 'monospace' }}>
            Object ID: {objectId}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" onClick={handleGoHome}>
            Return to Home
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
