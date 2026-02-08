/**
 * ResultCard component
 * Displays a single search result with metadata
 */

import { Card, CardContent, Grid, Typography } from '@mui/material';
import type { SearchResult } from '../services/search';
import type { ObjectData } from '../types/metadata';

export interface ResultCardProps {
  /** Search result with score and ID */
  result: SearchResult;
  /** Object data for display */
  object: ObjectData;
}

/**
 * Maximum number of lines to show for description before truncating
 */
const DESCRIPTION_LINE_CLAMP = 3;

/**
 * Field name constant for object identifier
 */
const IDENTIFIER_FIELD = 'dcterms:identifier.moooi';

export default function ResultCard({ result, object }: ResultCardProps) {
  const title = object['dcterms:title'] || 'Untitled';
  const description = object['dcterms:description'] || '';
  const identifier = object[IDENTIFIER_FIELD];
  const creator = object['dcterms:creator'] || '';

  return (
    <Grid item xs={12} sm={12} md={6} key={result.id}>
      <Card
        elevation={2}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {title}
          </Typography>

          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            {identifier}
          </Typography>

          {creator && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Creator:</strong> {creator}
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
              {description}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
