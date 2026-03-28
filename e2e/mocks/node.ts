/**
 * MSW node server setup for Vitest unit tests
 * This runs in Node.js context during unit testing
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Create and configure the MSW server for Node.js
 * This intercepts network requests during unit tests
 */
export const server = setupServer(...handlers);

/**
 * Helper to reset handlers between tests
 */
export function resetHandlers() {
	server.resetHandlers();
}

/**
 * Helper to use custom handlers for specific tests
 */
export function useHandlers(customHandlers: Parameters<typeof server.use>) {
	server.use(...customHandlers);
}
