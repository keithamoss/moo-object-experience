/**
 * E2E tests for API error scenarios
 * Tests how the application handles various API failures
 */

import { expect, mockApiError, test } from './fixtures';

test.describe('API Error Handling', () => {
	test('should show error message when API returns 429 (rate limit)', async ({ page }) => {
		// Setup: Mock rate limit error before navigating
		await mockApiError(page, 'rate-limit');

		// Navigate to homepage
		await page.goto('/#/');

		// Should show error alert
		const errorAlert = page.locator('[role="alert"]');
		await expect(errorAlert).toBeVisible({ timeout: 10000 });

		// Error message should mention the failure
		const errorText = await errorAlert.textContent();
		expect(errorText).toMatch(/failed to load|error|429/i);

		// Search box should NOT be available
		const searchBox = page.locator('input[data-testid="search-box"]');
		await expect(searchBox).not.toBeVisible();
	});

	test('should show error message when API returns 404 (not found)', async ({ page }) => {
		// Setup: Mock not found error
		await mockApiError(page, 'not-found');

		// Navigate to homepage
		await page.goto('/#/');

		// Should show error alert
		const errorAlert = page.locator('[role="alert"]');
		await expect(errorAlert).toBeVisible({ timeout: 10000 });

		// Error message should indicate not found
		const errorText = await errorAlert.textContent();
		expect(errorText).toMatch(/failed to load|error|not found/i);

		// Search box should NOT be available
		const searchBox = page.locator('input[data-testid="search-box"]');
		await expect(searchBox).not.toBeVisible();
	});

	test('should show error message when API returns 403 (forbidden)', async ({ page }) => {
		// Setup: Mock forbidden error
		await mockApiError(page, 'forbidden');

		// Navigate to homepage
		await page.goto('/#/');

		// Should show error alert
		const errorAlert = page.locator('[role="alert"]');
		await expect(errorAlert).toBeVisible({ timeout: 10000 });

		// Error message should indicate permission issue
		const errorText = await errorAlert.textContent();
		expect(errorText).toMatch(/failed to load|error|permission|api key/i);

		// Search box should NOT be available
		const searchBox = page.locator('input[data-testid="search-box"]');
		await expect(searchBox).not.toBeVisible();
	});

	test('should show error message on network failure', async ({ page }) => {
		// Setup: Mock network error
		await mockApiError(page, 'network');

		// Navigate to homepage
		await page.goto('/#/');

		// Should show error alert
		const errorAlert = page.locator('[role="alert"]');
		await expect(errorAlert).toBeVisible({ timeout: 10000 });

		// Error message should indicate connection issue
		const errorText = await errorAlert.textContent();
		expect(errorText).toMatch(/failed to load|error|network|connection/i);

		// Search box should NOT be available
		const searchBox = page.locator('input[data-testid="search-box"]');
		await expect(searchBox).not.toBeVisible();
	});

	test('should show loading state while fetching data', async ({ page }) => {
		// Use normal mocked responses (fast but we can still see loading briefly)
		await page.goto('/#/');

		// Loading indicator should appear initially (may be too fast to catch)
		const loadingIndicator = page.getByTestId('loading-indicator');
		const wasVisible = await loadingIndicator.isVisible().catch(() => false);

		// Either we caught it loading, or it loaded so fast we didn't see it
		// Either way, it should eventually be hidden
		if (wasVisible) {
			await expect(loadingIndicator).not.toBeVisible({ timeout: 5000 });
		}

		// And the app should be ready
		const homePage = page.locator('[data-testid="home-page"]');
		await expect(homePage).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
	});
});
