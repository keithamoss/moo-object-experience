import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import {
  Box,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs';
import NotFoundPage from '../../components/NotFoundPage';
import ObjectDetailSkeleton from '../../components/ObjectDetailSkeleton';
import { useMetadataFields, useObject } from '../../store';
import { useAppSelector } from '../../store/hooks';
import { selectSearchQuery } from '../../store/searchSlice';
import { buildSearchURL } from '../../utils/urlUtils';
import { FieldValue } from './FieldValue';
import { useObjectDisplay } from './useObjectDisplay';

export default function ObjectDetailPage() {
  const { id } = useParams<{ id: string; slug?: string }>();
  const [searchParams] = useSearchParams();
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());

  // Get current search query from Redux for breadcrumb link
  const searchQuery = useAppSelector(selectSearchQuery);

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

  // Extract display data using custom hook (must be called before conditional returns)
  const { title, identifier, description, identifierLabel, descriptionLabel, imageUrls, fieldsToDisplay } =
    useObjectDisplay({
      object,
      metadata,
    });

  const handleImageError = (idx: number) => {
    setBrokenImages((prev) => new Set(prev).add(idx));
  };

  // Consolidate all loading checks
  const isLoading = isLoadingMetadata || isFetchingMetadata || isLoadingObject || isFetchingObject;

  // Return 404 if ID is missing
  if (!id) {
    return <NotFoundPage />;
  }

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return <ObjectDetailSkeleton />;
  }

  // Only show 404 if the query has completed successfully but returned no object
  if (isSuccessObject && !object) {
    return <NotFoundPage />;
  }

  // Wait for object to load
  if (!object) {
    return <ObjectDetailSkeleton />;
  }

  // Defensive check: identifier should always exist but handle edge case
  if (!identifier) {
    console.error('Object missing required identifier field', object);
    return <NotFoundPage />;
  }

  // Build breadcrumb navigation
  const breadcrumbItems: Array<{ label: string; path?: string }> = [
    { label: 'Home', path: '/' },
  ];

  // Add search results breadcrumb if we have a search query
  if (searchQuery) {
    breadcrumbItems.push({
      label: 'Search Results',
      path: buildSearchURL(searchQuery, searchParams),
    });
  }

  // Current object is the last breadcrumb (not clickable)
  breadcrumbItems.push({
    label: title || identifier,
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Helmet>
        <title>{title} | Museum Object Experience</title>
      </Helmet>

      {/* Breadcrumb navigation */}
      <Breadcrumbs items={breadcrumbItems} />

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
