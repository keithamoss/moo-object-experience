/**
 * E2E Test Helper Functions
 * Provides robust wait patterns for application-specific states
 */

import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Wait for the application to finish loading data and be ready for interaction
 * This ensures that:
 * 1. The loading indicator has disappeared
 * 2. The home page is marked as ready (data loaded successfully)
 *
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait in milliseconds (default: 10000 - sufficient for mocked API)
 */
export async function waitForAppReady(page: Page, timeout = 10000): Promise<void> {
	// First, wait for the page to be in a stable network state
	await page.waitForLoadState('networkidle', { timeout });

	// Wait for the home page element to exist
	const homePage = page.locator('[data-testid="home-page"]');
	await homePage.waitFor({ state: 'attached', timeout });

	// Wait for the loading state to be false (data loading complete)
	await expect(homePage).toHaveAttribute('data-loading', 'false', { timeout });

	// Wait for the ready state to be true (data successfully loaded)
	// If this fails, it might indicate a data loading error
	try {
		await expect(homePage).toHaveAttribute('data-ready', 'true', { timeout });
	} catch (error) {
		// Check if there's an error message on the page
		const errorAlert = page.locator('[role="alert"]');
		const hasError = await errorAlert.isVisible().catch(() => false);
		if (hasError) {
			const errorText = await errorAlert.textContent();
			throw new Error(`App failed to load data: ${errorText}`);
		}
		throw error;
	}

	// Optional: Also check that loading indicator is gone if it was present
	const loadingIndicator = page.getByTestId('loading-indicator');
	const isLoadingVisible = await loadingIndicator.isVisible().catch(() => false);
	if (isLoadingVisible) {
		await loadingIndicator.waitFor({ state: 'hidden', timeout: 5000 });
	}
}

/**
 * Wait for the search box to be visible, enabled, and ready for interaction
 * This is a reliable way to ensure the search functionality is fully loaded
 *
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait in milliseconds (default: 10000)
 * @returns The search box locator
 */
export async function waitForSearchBox(page: Page, timeout = 10000): Promise<Locator> {
	// Locate the search box by test ID (now on the input element itself)
	const searchBox = page.locator('input[data-testid="search-box"]');

	// Wait for it to be visible in the DOM
	await searchBox.waitFor({ state: 'visible', timeout });

	// Wait for it to be marked as ready (not disabled)
	await expect(searchBox).toHaveAttribute('data-ready', 'true', { timeout });

	// Also ensure it's actually enabled (double check)
	await expect(searchBox).toBeEnabled({ timeout });

	return searchBox;
}

/**
 * Navigate to the homepage and wait for it to be fully ready
 * This is the recommended way to start tests that need the homepage
 *
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait in milliseconds (default: 10000)
 */
export async function goToHomePage(page: Page, timeout = 10000): Promise<void> {
	await page.goto('/#/');
	await waitForAppReady(page, timeout);
}

/**
 * Navigate to homepage and get the search box ready for interaction
 * Combines navigation, app readiness check, and search box readiness
 *
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait in milliseconds (default: 10000)
 * @returns The search box locator, ready for interaction
 */
export async function setupSearchTest(page: Page, timeout = 10000): Promise<Locator> {
	await goToHomePage(page, timeout);
	return await waitForSearchBox(page, timeout);
}

/**
 * Perform a search by filling the search box and pressing Enter
 * Waits for the URL to update with the search query
 *
 * @param searchBox - The search box locator
 * @param query - Search query to enter
 * @param page - Playwright Page object (needed to wait for URL)
 */
export async function performSearch(searchBox: Locator, query: string, page: Page): Promise<void> {
	await searchBox.fill(query);
	await searchBox.press('Enter');

	// Wait for URL to update with the query parameter
	await page.waitForURL(new RegExp(`\\?q=${encodeURIComponent(query)}`), { timeout: 5000 });
}

/**
 * Wait for search results to appear on the page
 * Looks for the results heading and at least one result card
 *
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 */
export async function waitForSearchResults(page: Page, timeout = 5000): Promise<void> {
	// Wait for results heading to appear
	const resultsHeading = page.locator('h6:has-text("result")');
	await expect(resultsHeading).toBeVisible({ timeout });

	// Wait for at least one result card
	const resultCards = page.getByTestId('result-card');
	await expect(resultCards.first()).toBeVisible({ timeout });
}
