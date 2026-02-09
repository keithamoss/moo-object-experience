import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Container, IconButton, Paper, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import NotFoundPage from '../../components/NotFoundPage';
import { OBJECT_FIELDS } from '../../constants/objectFields';
import { useMetadataFields, useObject } from '../../store';

export default function ObjectDetailPage() {
  const { id } = useParams<{ id: string; slug?: string }>();
  const navigate = useNavigate();

  // Decode the ID from the URL (in case it was URL-encoded)
  const decodedId = id ? decodeURIComponent(id) : '';

  // Fetch metadata first (required for objects query)
  const {
    fields: metadata,
    isLoading: isLoadingMetadata,
    isFetching: isFetchingMetadata,
  } = useMetadataFields();

  // Only fetch object if we have valid ID and metadata is loaded
  const hasMetadata = metadata && metadata.length > 0;
  const shouldFetchObject = !!id && hasMetadata;

  // Fetch the object from the store
  const {
    object,
    isLoading: isLoadingObject,
    isFetching: isFetchingObject,
    isSuccess: isSuccessObject,
  } = useObject(decodedId, shouldFetchObject ? metadata : []);

  const handleBack = () => {
    navigate(-1);
  };

  // Consolidate all loading checks
  const isLoading = isLoadingMetadata || isFetchingMetadata || isLoadingObject || isFetchingObject;

  // Return 404 if ID is missing
  if (!id) {
    return <NotFoundPage />;
  }

  // Show loading if data is being fetched
  if (isLoading) {
    return <LoadingIndicator message="Loading object..." />;
  }

  // Only show 404 if the query has completed successfully but returned no object
  if (isSuccessObject && !object) {
    return <NotFoundPage />;
  }

  // Wait for object to load
  if (!object) {
    return <LoadingIndicator message="Loading object..." />;
  }

  // At this point we know object exists - extract fields
  const title = object[OBJECT_FIELDS.TITLE] || 'Untitled';
  const identifier = object[OBJECT_FIELDS.IDENTIFIER];

  // Defensive check: identifier should always exist but handle edge case
  if (!identifier) {
    console.error('Object missing required identifier field', object);
    return <NotFoundPage />;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Helmet>
        <title>{title} | Westralian People's Museum</title>
      </Helmet>

      <Box sx={{ mb: 2 }}>
        <IconButton onClick={handleBack} aria-label="back to previous page">
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          ID: {identifier}
        </Typography>
        <Typography variant="body1" sx={{ mt: 3 }}>
          Full object details will be displayed here in Phase 4.2.
        </Typography>
      </Paper>
    </Container>
  );
}
