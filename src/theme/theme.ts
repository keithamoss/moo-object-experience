import { createTheme } from '@mui/material/styles';

// Define your color palette
export const colors = {
  primary: {
    main: '#bdbdbd',
    light: '#e0e0e0',
    dark: '#9e9e9e',
    contrastText: '#212121', // Dark text for accessibility on light grey background
  },
  secondary: {
    main: '#dc004e',
    light: '#f73378',
    dark: '#9a0036',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },
};

// Create the theme
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});
