import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { errorHandlers } from '../../../e2e/mocks/handlers';
import { server } from '../../../e2e/mocks/node';
import { PageMetadataProvider } from '../../components/PageMetadata';
import { setQuery } from '../../store/searchSlice';
import { createTestStore } from '../../test-utils/test-helpers';
import ObjectDetailPage from './ObjectDetailPage';

/**
 * Renders ObjectDetailPage with a real memory router so that useParams()
 * and useSearchParams() resolve correctly without mocking react-router-dom.
 */
function renderObjectDetail(id: string, searchQuery = '', reduxSearchQuery = '') {
	const store = createTestStore();
	if (reduxSearchQuery) {
		store.dispatch(setQuery(reduxSearchQuery));
	}

	const searchPart = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
	const router = createMemoryRouter(
		[{ path: '/object/:id', element: <ObjectDetailPage /> }],
		{ initialEntries: [`/object/${encodeURIComponent(id)}${searchPart}`] },
	);

	return {
		store,
		...render(
			<Provider store={store}>
				<PageMetadataProvider>
					<RouterProvider router={router} />
				</PageMetadataProvider>
			</Provider>,
		),
	};
}

describe('ObjectDetailPage', () => {
	it('should show a loading skeleton while data is being fetched', () => {
		renderObjectDetail('2021.0001');

		// The skeleton is shown synchronously before the query resolves
		const skeletons = document.querySelectorAll('[class*="MuiSkeleton"]');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('should render the object title after data loads', async () => {
		renderObjectDetail('2021.0001');

		await waitFor(() =>
			expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(),
			{ timeout: 3000 },
		);

		// Default factory title for id 2021.0001 (forestsEpaulette)
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Forests Department/i);
	});

	it('should render the object identifier', async () => {
		renderObjectDetail('2021.0001');

		await waitFor(() =>
			expect(screen.getByText(/2021\.0001/i)).toBeInTheDocument(),
			{ timeout: 3000 },
		);
	});

	it('should render breadcrumb navigation', async () => {
		renderObjectDetail('2021.0001');

		await waitFor(() =>
			expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument(),
			{ timeout: 3000 },
		);
	});

	it('should show a "Search Results" breadcrumb when a search query is present', async () => {
		renderObjectDetail('2021.0001', 'department', 'department');

		await waitFor(() =>
			expect(screen.getByText(/search results/i)).toBeInTheDocument(),
			{ timeout: 3000 },
		);
	});

	it('should render a 404 page for a non-existent object ID', async () => {
		renderObjectDetail('DOES-NOT-EXIST-99999');

		await waitFor(() =>
			expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument(),
			{ timeout: 3000 },
		);
	});

	it('should render an error alert when the API returns an error', async () => {
		server.use(...errorHandlers.rateLimitError);

		renderObjectDetail('2021.0001');

		await waitFor(() =>
			expect(screen.getByRole('alert')).toBeInTheDocument(),
			{ timeout: 5000 },
		);
	});
});
