import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from '../e2e/mocks/node';

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const MUI_ANCHOR_WARNING = 'MUI: The `anchorEl` prop provided to the component is invalid.';

function shouldSilenceMUIAnchorWarning(args: unknown[]): boolean {
	const message = args
		.map((arg) => (typeof arg === 'string' ? arg : ''))
		.join(' ')
		.trim();

	return message.includes(MUI_ANCHOR_WARNING);
}

// Start MSW server before all tests
beforeAll(() => {
	// Prevent jsdom "Not implemented: Window's scrollTo() method" noise.
	if (typeof window !== 'undefined') {
		Object.defineProperty(window, 'scrollTo', {
			value: vi.fn(),
			writable: true,
		});
	}

	// Filter known MUI Popper warning in jsdom where layout/anchor positioning is not realistic.
	vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
		if (shouldSilenceMUIAnchorWarning(args)) {
			return;
		}

		originalConsoleError(...args);
	});

	vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
		if (shouldSilenceMUIAnchorWarning(args)) {
			return;
		}

		originalConsoleWarn(...args);
	});

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
