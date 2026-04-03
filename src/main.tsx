import '@gfazioli/mantine-parallax/styles.css';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import NotFoundPage from './components/NotFoundPage';
import { PageMetadataProvider } from './components/PageMetadata';
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

const rootElement = document.getElementById('root');
if (!rootElement) {
	throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<Provider store={store}>
			<PageMetadataProvider>
				<MantineProvider theme={theme}>
					<RouterProvider router={router} />
				</MantineProvider>
			</PageMetadataProvider>
		</Provider>
	</React.StrictMode>,
);
