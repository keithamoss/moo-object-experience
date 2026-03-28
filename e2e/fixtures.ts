/**
 * Playwright test fixtures with API mocking support
 * Extends base Playwright test to automatically mock Google Sheets API for each test
 */

import { test as base, type Page } from '@playwright/test';
import { mockMappingsResponse, mockMuseumResponse } from './fixtures/sheetsData';

const SHEETS_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
const SHEET_ID = '1jarQ6R_kCPABkjqX6bM1OD5xsl0TCpMEwlc29ItqSp8';

/**
 * Setup API mocking for a page
 */
async function setupApiMocking(page: Page) {
	// Mock Mappings worksheet
	await page.route(`${SHEETS_BASE_URL}/${SHEET_ID}/values/Mappings*`, async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(mockMappingsResponse),
		});
	});

	// Mock Museum worksheet
	await page.route(`${SHEETS_BASE_URL}/${SHEET_ID}/values/Museum*`, async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(mockMuseumResponse),
		});
	});
}

/**
 * Extended Playwright test with automatic API mocking
 * API routes are automatically mocked before each test
 */
export const test = base.extend({
	page: async ({ page }, use) => {
		// Setup API mocking before the test
		await setupApiMocking(page);

		// Use the page for the test
		await use(page);
	},
});

/**
 * Override just the Museum route with a custom response.
 * Because Playwright evaluates routes newest-first, calling this after the
 * base fixture has already registered the default Museum mock is enough to
 * take precedence — no need to tear down and re-register all routes.
 */
export async function mockMuseumWith(page: Page, response: unknown) {
	await page.route(`${SHEETS_BASE_URL}/${SHEET_ID}/values/Museum*`, async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(response),
		});
	});
}

/**
 * Helper to mock API error responses for specific tests
 */
export async function mockApiError(
	page: Page,
	errorType: 'rate-limit' | 'not-found' | 'forbidden' | 'network' | 'timeout',
) {
	const pattern = `${SHEETS_BASE_URL}/${SHEET_ID}/values/*`;

	switch (errorType) {
		case 'rate-limit':
			await page.route(pattern, async (route) => {
				await route.fulfill({
					status: 429,
					headers: { 'Retry-After': '60' },
				});
			});
			break;

		case 'not-found':
			await page.route(pattern, async (route) => {
				await route.fulfill({
					status: 404,
					contentType: 'application/json',
					body: JSON.stringify({
						error: {
							code: 404,
							message: 'Requested entity was not found.',
							status: 'NOT_FOUND',
						},
					}),
				});
			});
			break;

		case 'forbidden':
			await page.route(pattern, async (route) => {
				await route.fulfill({
					status: 403,
					contentType: 'application/json',
					body: JSON.stringify({
						error: {
							code: 403,
							message: 'The request is missing a valid API key.',
							status: 'PERMISSION_DENIED',
						},
					}),
				});
			});
			break;

		case 'network':
			await page.route(pattern, async (route) => {
				await route.abort('failed');
			});
			break;

		case 'timeout':
			await page.route(pattern, async (route) => {
				// Delay for longer than typical timeout
				await new Promise((resolve) => setTimeout(resolve, 31000));
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(mockMappingsResponse),
				});
			});
			break;
	}
}

// Re-export expect for convenience
export { expect } from '@playwright/test';
