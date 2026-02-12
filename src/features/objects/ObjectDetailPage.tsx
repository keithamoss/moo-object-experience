import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import {
  Box,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import NotFoundPage from '../../components/NotFoundPage';
import { useMetadataFields, useObject } from '../../store';
import { FieldValue } from './FieldValue';
import { useObjectDisplay } from './useObjectDisplay';

export default function ObjectDetailPage() {
  const { id } = useParams<{ id: string; slug?: string }>();
  const navigate = useNavigate();
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());

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

  const handleImageError = (idx: number) => {
    setBrokenImages((prev) => new Set(prev).add(idx));
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

  // Extract display data using custom hook
  const { title, identifier, description, identifierLabel, descriptionLabel, imageUrls, fieldsToDisplay } =
    useObjectDisplay({
      object,
      metadata,
    });

  // Defensive check: identifier should always exist but handle edge case
  if (!identifier) {
    console.error('Object missing required identifier field', object);
    return <NotFoundPage />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Helmet>
        <title>{title} | Westralian People's Museum</title>
      </Helmet>

      {/* Back button */}
      <Box sx={{ mb: 2 }}>
        <IconButton onClick={handleBack} aria-label="back to previous page">
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* Hero Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {identifierLabel}: {identifier}
        </Typography>
      </Paper>

      {/* Main Content: 2-column layout on desktop, stacked on mobile */}
      <Grid container spacing={3}>
        {/* Left Column: Description and Images */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Description Section */}
            {description && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {descriptionLabel}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {description}
                </Typography>
              </Paper>
            )}

            {/* Images Section */}
            {imageUrls.length > 0 && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Images
                </Typography>
                {imageUrls.map((url, idx) => (
                  <Box key={idx} sx={{ mb: idx < imageUrls.length - 1 ? 2 : 0 }}>
                    {brokenImages.has(idx) ? (
                      <Box
                        sx={{
                          width: '100%',
                          minHeight: 200,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'grey.100',
                          borderRadius: 1,
                          p: 3,
                        }}
                      >
                        <BrokenImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          Image unavailable
                        </Typography>
                      </Box>
                    ) : (
                      <img
                        src={url}
                        alt={`${title} - Image ${idx + 1}`}
                        loading="lazy"
                        onError={() => handleImageError(idx)}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          borderRadius: '4px',
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Paper>
            )}
          </Box>
        </Grid>

        {/* Right Column: Metadata Fields */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Metadata
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {fieldsToDisplay.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No additional metadata available
              </Typography>
            ) : (
              <List disablePadding>
                {fieldsToDisplay.map((field, idx) => (
                  <ListItem
                    key={field.field}
                    alignItems="flex-start"
                    sx={{
                      px: 0,
                      py: 1.5,
                      borderBottom: idx < fieldsToDisplay.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemText
                      primary={field.label}
                      secondary={
                        <FieldValue
                          value={object[field.field]}
                          fieldTypeAndControls={field.fieldTypeAndControls}
                        />
                      }
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 'bold',
                        color: 'text.secondary',
                      }}
                      secondaryTypographyProps={{
                        variant: 'body1',
                        color: 'text.primary',
                        component: 'div',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
