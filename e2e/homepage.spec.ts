import { expect, test } from '@playwright/test';

/**
 * E2E tests for the homepage and search functionality
 */

test.describe('Homepage', () => {
	test('should load the homepage', async ({ page }) => {
		await page.goto('/#/');

		// Check page title
		await expect(page).toHaveTitle(/Museum Object Experience/);

		// Check search bar is visible and enabled (data loaded)
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeVisible();
		await expect(searchBox).toBeEnabled({ timeout: 5000 });
	});

	test('should perform a search and show appropriate feedback', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Search for a term that should return results
		await searchBox.fill('department');

		// Press Enter to submit search
		await searchBox.press('Enter');

		// Wait for URL to update
		await page.waitForURL(/\?q=department/, { timeout: 3000 });

		// Verify search box retains the value
		await expect(searchBox).toHaveValue('department');

		// Should show results count
		const resultsHeading = page.locator('h6:has-text("result")');
		await expect(resultsHeading).toBeVisible();

		// Should show at least one result card (MUI Card component)
		const resultCards = page.locator('.MuiCard-root');
		await expect(resultCards.first()).toBeVisible();

		// Results count should be greater than 0
		const resultsText = await resultsHeading.textContent();
		expect(resultsText).toMatch(/\d+\s+results?\s+for/i);
	});

	test('should navigate to object detail page when clicking a result', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Search for a term that should return results
		await searchBox.fill('department');

		// Press Enter to submit search
		await searchBox.press('Enter');

		// Wait for URL to update
		await page.waitForURL(/\?q=department/, { timeout: 3000 });

		// Should show results heading (test will fail if no results)
		const resultsHeading = page.locator('h6:has-text("result")');
		await expect(resultsHeading).toBeVisible();

		// Click first result
		const firstResult = page.locator('.MuiCard-root').first();
		await expect(firstResult).toBeVisible();
		await firstResult.click();

		// Should navigate to detail page
		await expect(page).toHaveURL(/\/object\/.+/);

		// Should show object details (check for specific heading)
		await expect(page.locator('h1').first()).toBeVisible();
	});

	test('should update URL with search parameters', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Perform a search
		await searchBox.fill('pottery');
		await searchBox.press('Enter');

		// URL should be updated with query parameter
		await page.waitForURL(/\?q=pottery/, { timeout: 3000 });
		await expect(page).toHaveURL(/\?q=pottery/);

		// Search box should retain the value
		await expect(searchBox).toHaveValue('pottery');
	});
});
