import { generateColors } from '@mantine/colors-generator';
import { createTheme } from '@mantine/core';

export const theme = createTheme({
	primaryColor: 'crimson',
	colors: {
		ocean: generateColors('#335c67'),
		sand: generateColors('#fff3b0'),
		amber: generateColors('#e09f3e'),
		crimson: generateColors('#9e2a2b'),
		maroon: generateColors('#540b0e'),
	},
	// primaryShade: 4,
	// fontFamily: 'Roboto, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
	// defaultRadius: 'sm',
});
