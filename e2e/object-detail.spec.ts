import { expect, test } from '@playwright/test';

/**
 * E2E tests for object detail pages
 */

test.describe('Object Detail Page', () => {
	test('should load object detail page directly via URL', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load (search input should be enabled)
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Search for results
		await searchBox.fill('department');
		await searchBox.press('Enter');

		// Wait for results
		await page.waitForURL(/\?q=department/, { timeout: 3000 });

		// Should have results
		const resultsHeading = page.locator('h6:has-text("result")');
		await expect(resultsHeading).toBeVisible();

		// Click first result
		const firstResult = page.locator('.MuiCard-root').first();
		await expect(firstResult).toBeVisible();
		await firstResult.click();

		// Get the URL of the detail page
		await page.waitForURL(/\/object\/.+/);
		const url = page.url();

		// Reload the page directly
		await page.goto(url);

		// Should still show the object details (check for specific heading)
		await expect(page.locator('h1').first()).toBeVisible();
		await expect(page.getByText(/identifier/i)).toBeVisible();
	});

	test('should show breadcrumbs navigation', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Perform search
		await searchBox.fill('department');
		await searchBox.press('Enter');

		// Wait for results
		await page.waitForURL(/\?q=department/, { timeout: 3000 });

		// Should have results
		const resultsHeading = page.locator('h6:has-text("result")');
		await expect(resultsHeading).toBeVisible();

		// Click first result
		const firstResult = page.locator('.MuiCard-root').first();
		await expect(firstResult).toBeVisible();
		await firstResult.click();

		// Wait for navigation to detail page
		await page.waitForURL(/\/object\/.+/);

		// Should show breadcrumbs
		const breadcrumbs = page.locator('nav[aria-label="breadcrumb"]');
		await expect(breadcrumbs).toBeVisible();

		// Breadcrumbs should have "Home" link
		await expect(breadcrumbs.getByText(/home/i)).toBeVisible();

		// Breadcrumbs should have "Search Results" link
		await expect(breadcrumbs.getByText(/search results/i)).toBeVisible();
	});

	test('should navigate back to search results using browser back', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Perform search
		await searchBox.fill('department');
		await searchBox.press('Enter');

		// Wait for search to complete
		await page.waitForURL(/\?q=department/, { timeout: 3000 });

		// Should have results
		const resultsHeading = page.locator('h6:has-text("result")');
		await expect(resultsHeading).toBeVisible();

		// Click first result
		const firstResult = page.locator('.MuiCard-root').first();
		await expect(firstResult).toBeVisible();
		await firstResult.click();

		// Wait for navigation
		await expect(page).toHaveURL(/\/object\/.+/);

		// Go back
		await page.goBack();

		// Should be back on search page with search term preserved
		await expect(page).toHaveURL(/\?q=department/);
		await expect(searchBox).toHaveValue('department');
	});

	test('should handle invalid object ID gracefully', async ({ page }) => {
		// Try to access a non-existent object
		const response = await page.goto('#/object/invalid-object-id-12345');

		// Page should load without crashing (200 or redirect)
		expect(response?.status()).toBeLessThan(500);

		// Should display NotFoundPage component
		const notFoundHeading = page.locator('h1:has-text("404")');
		await expect(notFoundHeading).toBeVisible();

		// Should show "Page Not Found" message
		await expect(page.getByText(/page not found/i)).toBeVisible();

		// Should have a button to go back home
		const homeButton = page.getByRole('button', { name: /go to home/i });
		await expect(homeButton).toBeVisible();
	});
});
