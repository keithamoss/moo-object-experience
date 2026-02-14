/**
 * Testing utilities and helpers
 * Provides common patterns for testing React components with Redux and Router
 */

import { configureStore } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react';
import { PropsWithChildren, ReactElement } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { sheetsApi } from '../store/api';
import searchReducer, { SearchState } from '../store/searchSlice';
import { RootState } from '../store/store';

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
    <HelmetProvider>
      <Provider store={store}>
        <MemoryRouter {...routerProps}>{children}</MemoryRouter>
      </Provider>
    </HelmetProvider>
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
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
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
    'dcterms:identifier.moooi': 'TEST-001',
    'dcterms:title': 'Test Object',
    'dcterms:description': 'Test Description',
    'dcterms:creator': 'Test Creator',
    'dcterms:date': '2024-01-01',
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

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

