/**
 * Testing utilities and helpers
 * Provides common patterns for testing React components with Redux and Router
 */

import { MantineProvider } from '@mantine/core';
import { configureStore } from '@reduxjs/toolkit';
import { type RenderOptions, render as renderWithMantine } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { PageMetadataProvider } from '../components/PageMetadata';
import { OBJECT_FIELDS } from '../constants/objectFields';
import { sheetsApi } from '../store/api';
import searchReducer, { type SearchState } from '../store/searchSlice';
import type { RootState } from '../store/store';
import { theme } from '../theme/theme';

/**
 * Create a test store with optional preloaded state
 */
export function createTestStore(preloadedState?: Partial<RootState>) {
	const store = configureStore({
		reducer: {
			[sheetsApi.reducerPath]: sheetsApi.reducer,
			search: searchReducer,
		},
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: false,
			}).concat(sheetsApi.middleware),
	});

	// If preloaded state is provided, dispatch actions to set it
	if (preloadedState?.search) {
		// For search state, we'd need to import and dispatch actions
		// For now, just return the store with default state
	}

	return store;
}

/**
 * Options for rendering with providers
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
	preloadedState?: Partial<RootState>;
	store?: ReturnType<typeof createTestStore>;
	routerProps?: MemoryRouterProps;
}

/**
 * Test wrapper with Redux Provider and Router
 */
export function AllTheProviders({
	children,
	store,
	routerProps = {},
}: PropsWithChildren<{
	store: ReturnType<typeof createTestStore>;
	routerProps?: MemoryRouterProps;
}>) {
	return (
		<MantineProvider theme={theme}>
			<Provider store={store}>
				<PageMetadataProvider>
					<MemoryRouter {...routerProps}>{children}</MemoryRouter>
				</PageMetadataProvider>
			</Provider>
		</MantineProvider>
	);
}

/**
 * Render component with Redux store and Router
 * Use this instead of RTL's render for components that need Redux or routing
 */
export function renderWithProviders(
	ui: ReactElement,
	{
		preloadedState = {},
		store = createTestStore(preloadedState),
		routerProps = {},
		...renderOptions
	}: ExtendedRenderOptions = {},
) {
	function Wrapper({ children }: PropsWithChildren) {
		return (
			<AllTheProviders store={store} routerProps={routerProps}>
				{children}
			</AllTheProviders>
		);
	}

	return {
		store,
		...renderWithMantine(ui, { wrapper: Wrapper, ...renderOptions }),
	};
}

/**
 * Create mock search state
 */
export function createMockSearchState(overrides: Partial<SearchState> = {}): SearchState {
	return {
		query: '',
		results: [],
		activeSearchFields: [],
		indexReady: false,
		...overrides,
	};
}

/**
 * Create mock ObjectData
 */
export function createMockObjectData(overrides = {}) {
	return {
		[OBJECT_FIELDS.IDENTIFIER]: 'TEST-001',
		[OBJECT_FIELDS.TITLE]: 'Test Object',
		[OBJECT_FIELDS.DESCRIPTION]: 'Test Description',
		[OBJECT_FIELDS.CREATOR]: 'Test Creator',
		[OBJECT_FIELDS.DATE_ACCEPTED]: '2024-01-01',
		...overrides,
	};
}

/**
 * Create mock SearchResult
 */
export function createMockSearchResult(overrides = {}) {
	return {
		id: 'TEST-001',
		score: 1.5,
		match: {},
		...overrides,
	};
}

/**
 * Wait for async updates
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

// Re-export everything from testing library (render is overridden below)
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

/**
 * Plain render with MantineProvider — use when no Redux/Router context needed
 */
export function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
	function Wrapper({ children }: PropsWithChildren) {
		return <MantineProvider theme={theme}>{children}</MantineProvider>;
	}
	return renderWithMantine(ui, { wrapper: Wrapper, ...options });
}
