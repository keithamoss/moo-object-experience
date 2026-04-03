import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from '../e2e/mocks/node';

// Start MSW server before all tests
beforeAll(() => {
	// Prevent jsdom "Not implemented: Window's scrollTo() method" noise.
	if (typeof window !== 'undefined') {
		Object.defineProperty(window, 'scrollTo', {
			value: vi.fn(),
			writable: true,
		});

		// Mantine's MantineProvider uses matchMedia for color scheme detection.
		// jsdom doesn't implement it, so we provide a minimal stub.
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		});

		// Mantine Autocomplete/Combobox uses ResizeObserver; jsdom doesn't implement it.
		if (!window.ResizeObserver) {
			class ResizeObserverMock {
				observe = vi.fn();
				unobserve = vi.fn();
				disconnect = vi.fn();
			}
			window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
		}
	}

	server.listen({
		// Fail tests if there's an unhandled request
		onUnhandledRequest: 'error',
	});
});

// Reset handlers and cleanup after each test
afterEach(() => {
	cleanup();
	server.resetHandlers();
});

// Stop MSW server after all tests
afterAll(() => {
	vi.restoreAllMocks();
	server.close();
});
