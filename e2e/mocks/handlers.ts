/**
 * MSW request handlers for mocking Google Sheets API
 * Used in both E2E tests (Playwright) and unit tests (Vitest)
 */

import { HttpResponse, http } from 'msw';
import { SHEETS_CONFIG } from '../../src/config/sheets';
import {
	mockEmptyMuseumResponse,
	mockMalformedMappingsResponse,
	mockMappingsResponse,
	mockMuseumResponse,
} from '../fixtures/sheetsData';

// Google Sheets API configuration
const { baseUrl: SHEETS_BASE_URL, sheetId: SHEET_ID } = SHEETS_CONFIG;

/**
 * Default handlers - happy path with successful responses
 */
export const handlers = [
	// Mock Mappings worksheet (metadata schema)
	http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/Mappings`, () => {
		return HttpResponse.json(mockMappingsResponse);
	}),

	// Mock Museum worksheet (object data)
	http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/Museum`, () => {
		return HttpResponse.json(mockMuseumResponse);
	}),
];

/**
 * Error handlers for testing error scenarios
 */
export const errorHandlers = {
	/**
	 * Simulate 429 Too Many Requests (rate limiting)
	 */
	rateLimitError: [
		http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/*`, () => {
			return new HttpResponse(null, {
				status: 429,
				statusText: 'Too Many Requests',
				headers: {
					'Retry-After': '60',
				},
			});
		}),
	],

	/**
	 * Simulate 404 Not Found (sheet doesn't exist)
	 */
	notFoundError: [
		http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/*`, () => {
			return new HttpResponse(
				JSON.stringify({
					error: {
						code: 404,
						message: 'Requested entity was not found.',
						status: 'NOT_FOUND',
					},
				}),
				{
					status: 404,
					statusText: 'Not Found',
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
		}),
	],

	/**
	 * Simulate 403 Forbidden (API key issues)
	 */
	forbiddenError: [
		http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/*`, () => {
			return new HttpResponse(
				JSON.stringify({
					error: {
						code: 403,
						message: 'The request is missing a valid API key.',
						status: 'PERMISSION_DENIED',
					},
				}),
				{
					status: 403,
					statusText: 'Forbidden',
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
		}),
	],

	/**
	 * Simulate network error (no response)
	 */
	networkError: [
		http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/*`, () => {
			return HttpResponse.error();
		}),
	],

	/**
	 * Simulate timeout (delayed response)
	 */
	timeoutError: [
		http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/*`, async () => {
			// Delay for longer than typical timeout
			await new Promise((resolve) => setTimeout(resolve, 31000));
			return HttpResponse.json(mockMappingsResponse);
		}),
	],

	/**
	 * Simulate malformed Mappings response (missing required columns)
	 */
	malformedMappingsError: [
		http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/Mappings`, () => {
			return HttpResponse.json(mockMalformedMappingsResponse);
		}),
		http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/Museum`, () => {
			return HttpResponse.json(mockMuseumResponse);
		}),
	],

	/**
	 * Simulate empty Museum response (no objects)
	 */
	emptyMuseumResponse: [
		http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/Mappings`, () => {
			return HttpResponse.json(mockMappingsResponse);
		}),
		http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/Museum`, () => {
			return HttpResponse.json(mockEmptyMuseumResponse);
		}),
	],

	/**
	 * Simulate Mappings succeeds but Museum fails
	 */
	partialFailure: [
		http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/Mappings`, () => {
			return HttpResponse.json(mockMappingsResponse);
		}),
		http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/Museum`, () => {
			return new HttpResponse(null, {
				status: 500,
				statusText: 'Internal Server Error',
			});
		}),
	],
};

/**
 * Helper to create a custom handler with specific response
 */
export function createCustomHandler(
	worksheet: 'Mappings' | 'Museum',
	response: Record<string, unknown> | unknown[],
	status = 200,
) {
	return http.get(`${SHEETS_BASE_URL}/${SHEET_ID}/values/${worksheet}`, () => {
		return HttpResponse.json(response as Record<string, unknown>, { status });
	});
}
