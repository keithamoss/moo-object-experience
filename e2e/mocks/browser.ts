/**
 * MSW browser worker setup for Playwright E2E tests
 * This runs in the browser context during testing
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * Create and configure the MSW browser worker
 * This intercepts network requests in the browser during E2E tests
 */
export const worker = setupWorker(...handlers);

/**
 * Start the worker with production-like settings
 */
export async function startMockServiceWorker() {
	await worker.start({
		// Suppress warnings about unhandled requests to keep test output clean
		onUnhandledRequest: 'bypass',

		// Service worker configuration
		serviceWorker: {
			// Path relative to the public directory
			url: '/mockServiceWorker.js',
		},

		// Disable console messages in tests (optional)
		quiet: false,
	});
}
