import { expect, test } from './fixtures';
import { setupSearchTest } from './helpers/waitHelpers';

/**
 * E2E tests for object detail pages
 */

test.describe('Object Detail Page', () => {
	test('should load object detail page directly via URL', async ({ page }) => {
		const searchBox = await setupSearchTest(page);

		// Search for results
		await searchBox.fill('department');
		await searchBox.press('Enter');

		// Wait for results
		await page.waitForURL(/\?q=department/, { timeout: 3000 });

		// Should have results
		const resultsHeading = page.locator('h6:has-text("result")');
		await expect(resultsHeading).toBeVisible();

		// Click first result
		const firstResult = page.getByTestId('result-card').first();
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
		const searchBox = await setupSearchTest(page);

		// Perform search
		await searchBox.fill('department');
		await searchBox.press('Enter');

		// Wait for results
		await page.waitForURL(/\?q=department/, { timeout: 3000 });

		// Should have results
		const resultsHeading = page.locator('h6:has-text("result")');
		await expect(resultsHeading).toBeVisible();

		// Click first result
		const firstResult = page.getByTestId('result-card').first();
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
		const searchBox = await setupSearchTest(page);

		// Perform search
		await searchBox.fill('department');
		await searchBox.press('Enter');

		// Wait for search to complete
		await page.waitForURL(/\?q=department/, { timeout: 3000 });

		// Should have results
		const resultsHeading = page.locator('h6:has-text("result")');
		await expect(resultsHeading).toBeVisible();

		// Click first result
		const firstResult = page.getByTestId('result-card').first();
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

		// Should show "Page Not Found" message in the heading
		await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();

		// Should have a button to go back home
		const homeButton = page.getByRole('button', { name: /go to home/i });
		await expect(homeButton).toBeVisible();
	});

	test('should display object title, identifier and description', async ({ page }) => {
		const searchBox = await setupSearchTest(page);

		await searchBox.fill('department');
		await searchBox.press('Enter');
		await page.waitForURL(/\?q=department/, { timeout: 3000 });

		const firstResult = page.getByTestId('result-card').first();
		await expect(firstResult).toBeVisible();
		await firstResult.click();

		await page.waitForURL(/\/object\/.+/);

		// Object title renders as the page-level heading
		const title = page.getByRole('heading', { level: 1 }).first();
		await expect(title).toBeVisible();
		expect(await title.textContent()).toBeTruthy();

		// Identifier value should appear on the page
		await expect(page.locator('text=/2021\\./').first()).toBeVisible();
	});

	test('should show the metadata fields section', async ({ page }) => {
		const searchBox = await setupSearchTest(page);

		await searchBox.fill('department');
		await searchBox.press('Enter');
		await page.waitForURL(/\?q=department/, { timeout: 3000 });

		const firstResult = page.getByTestId('result-card').first();
		await firstResult.click();
		await page.waitForURL(/\/object\/.+/);

		// The detail page renders metadata in a two-column grid layout.
		// At least one Paper section with a heading should be visible.
		const papers = page.locator('.MuiPaper-root');
		await expect(papers.first()).toBeVisible();
	});

	test('should show Home link in breadcrumb that navigates to homepage', async ({ page }) => {
		const searchBox = await setupSearchTest(page);

		await searchBox.fill('department');
		await searchBox.press('Enter');
		await page.waitForURL(/\?q=department/, { timeout: 3000 });

		const firstResult = page.getByTestId('result-card').first();
		await firstResult.click();
		await page.waitForURL(/\/object\/.+/);

		const homeLink = page.getByRole('link', { name: /home/i });
		await expect(homeLink).toBeVisible();
		await homeLink.click();

		await expect(page).toHaveURL(/#\/$/);
	});
});
