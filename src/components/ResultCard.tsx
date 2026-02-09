/**
 * ResultCard component
 * Displays a single search result with metadata
 */

import { Card, CardActionArea, CardContent, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { OBJECT_FIELDS } from '../constants/objectFields';
import type { SearchResult } from '../services/search';
import { CARD_HOVER_SX } from '../theme/cardStyles';
import type { ObjectData } from '../types/metadata';
import { highlightSearchTerms } from '../utils/highlightText';
import { generateObjectUrl } from '../utils/urlUtils';

export interface ResultCardProps {
  /** Search result with score and ID */
  result: SearchResult;
  /** Object data for display */
  object: ObjectData;
  /** Search query for highlighting (optional) */
  query?: string;
}

/**
 * Maximum number of lines to show for description before truncating
 */
const DESCRIPTION_LINE_CLAMP = 3;

/**
 * Extract common object fields with defaults
 */
function extractObjectFields(object: ObjectData) {
  return {
    title: (object[OBJECT_FIELDS.TITLE] as string) || 'Untitled',
    description: (object[OBJECT_FIELDS.DESCRIPTION] as string) || '',
    identifier: (object[OBJECT_FIELDS.IDENTIFIER] as string) || '',
    creator: (object[OBJECT_FIELDS.CREATOR] as string) || '',
  };
}

export default function ResultCard({ result, object, query = '' }: ResultCardProps) {
  const navigate = useNavigate();
  const { title, description, identifier, creator } = extractObjectFields(object);

  // Highlighted versions
  const highlightedTitle = highlightSearchTerms(title, query);
  const highlightedDescription = highlightSearchTerms(description, query);
  const highlightedCreator = highlightSearchTerms(creator, query);

  const handleClick = () => {
    // Don't navigate if identifier is missing
    if (!identifier) {
      console.error('Object missing identifier', object);
      return;
    }
    try {
      const url = generateObjectUrl(identifier, title);
      navigate(url);
    } catch (error) {
      console.error('Failed to generate URL for object', { identifier, title, error });
    }
  };

  return (
    <Grid item xs={12} sm={12} md={6} key={result.id}>
      <Card
        elevation={2}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          ...CARD_HOVER_SX,
        }}
      >
        <CardActionArea
          onClick={handleClick}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          <CardContent sx={{ flexGrow: 1, width: '100%' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {highlightedTitle}
            </Typography>

            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              {identifier}
            </Typography>

            {creator && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Creator:</strong> {highlightedCreator}
              </Typography>
            )}

            {description && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: DESCRIPTION_LINE_CLAMP,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {highlightedDescription}
              </Typography>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
}
