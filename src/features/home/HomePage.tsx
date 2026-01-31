import SearchIcon from '@mui/icons-material/Search';
import { Box, Container, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import LoadingIndicator from '../../components/LoadingIndicator';

export default function HomePage() {
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

      <Box sx={{ mt: 4 }}>
        <LoadingIndicator message="Loading collection data..." />
      </Box>
    </Container>
  );
}
