import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '../e2e/mocks/node';

// Start MSW server before all tests
beforeAll(() => {
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
	server.close();
});
