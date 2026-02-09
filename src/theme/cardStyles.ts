/**
 * Shared card styling constants
 */

import type { SxProps, Theme } from '@mui/material';

/**
 * Hover effect for interactive cards
 */
export const CARD_HOVER_SX: SxProps<Theme> = {
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: 4,
  },
};
