import SearchIcon from '@mui/icons-material/Search';
import { Alert, Box, Chip, Container, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useData } from '../../hooks/useData';

export default function HomePage() {
  const { metadata, objects, isLoading, error, isSuccess } = useData();

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Helmet>
        <title>Westralian People's Museum Object Experience</title>
        <meta
          name="description"
          content="Search and discover objects in the Westralian People's Museum of Objects of Interest and Reference Library"
        />
      </Helmet>

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

      <Paper elevation={2} sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="Search"
          placeholder="Search the collection..."
          variant="outlined"
          disabled
          inputProps={{
            'aria-label': 'Search the collection',
            'aria-describedby': 'search-status',
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon aria-hidden="true" />
              </InputAdornment>
            ),
          }}
        />
        <Typography id="search-status" variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Search functionality coming soon
        </Typography>
      </Paper>

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
            <Typography variant="body2">
              {typeof error === 'object' && error !== null && 'status' in error
                ? `Error ${(error as { status: string | number }).status}: ${(error as { error?: string; data?: unknown }).error ||
                JSON.stringify((error as { data?: unknown }).data) ||
                'Unknown error'
                }`
                : (error as { message?: string })?.message || 'An unknown error occurred'}
            </Typography>
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
