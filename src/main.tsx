import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import NotFoundPage from './components/NotFoundPage';
import HomePage from './features/home/HomePage';
import ObjectDetailPage from './features/objects/ObjectDetailPage';
import { store } from './store/store';
import { theme } from './theme/theme';

// Define routes
// Using HashRouter for GitHub Pages compatibility (avoids 404 on refresh)
const router = createHashRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
			{
				path: '/object/:id/:slug?',
				element: <ObjectDetailPage />,
			},
			{
				path: '*',
				element: <NotFoundPage />,
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Provider store={store}>
			<HelmetProvider>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<RouterProvider router={router} />
				</ThemeProvider>
			</HelmetProvider>
		</Provider>
	</React.StrictMode>,
);
