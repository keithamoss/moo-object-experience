import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingIndicatorProps {
  message?: string;
}

export default function LoadingIndicator({ message = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-label={message}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: 2,
      }}
    >
      <CircularProgress aria-label="Loading" />
      <Typography variant="body2" color="text.secondary" aria-hidden="true">
        {message}
      </Typography>
    </Box>
  );
}
