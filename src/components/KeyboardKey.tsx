/**
 * KeyboardKey component
 * Renders a keyboard key in a styled box for UI hints
 */

import { Box } from '@mui/material';

export interface KeyboardKeyProps {
  /** The keyboard key to display */
  children: React.ReactNode;
}

/**
 * Styled keyboard key component for displaying keyboard shortcuts
 */
export default function KeyboardKey({ children }: KeyboardKeyProps) {
  return (
    <Box
      component="kbd"
      sx={{
        padding: '2px 6px',
        borderRadius: '3px',
        border: '1px solid #ccc',
        fontSize: '0.85em',
        fontFamily: 'monospace',
        display: 'inline-block',
      }}
    >
      {children}
    </Box>
  );
}
