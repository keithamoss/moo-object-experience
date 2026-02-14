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

	test('should search for the clicked suggestion from dropdown, not the partial typed text', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Type a partial word to trigger autocomplete (e.g., "depar" for "department")
		const partialText = 'depar';
		await searchBox.fill(partialText);

		// Wait for autocomplete dropdown to appear
		// MUI Autocomplete renders options in a listbox with role="listbox"
		const autocompleteListbox = page.locator('[role="listbox"]');
		await expect(autocompleteListbox).toBeVisible({ timeout: 2000 });

		// Find and click the first suggestion
		const firstSuggestion = page.locator('[role="option"]').first();
		await expect(firstSuggestion).toBeVisible();

		// Get the text of the suggestion we're about to click
		const suggestionText = (await firstSuggestion.textContent()) || '';
		console.log(`Clicking suggestion: "${suggestionText}" (typed partial text was: "${partialText}")`);

		// Click the suggestion
		await firstSuggestion.click();

		// Wait a moment for URL to update
		await page.waitForTimeout(1000);

		// Check what the URL actually contains
		const currentUrl = page.url();
		const searchBoxValue = await searchBox.inputValue();
		console.log(`Current URL after click: ${currentUrl}`);
		console.log(`Search box value after click: "${searchBoxValue}"`);
		console.log(`Expected URL to contain: ?q=${suggestionText}`);

		// Verify the URL contains the clicked suggestion, not the partial typed text
		await expect(page).toHaveURL(new RegExp(`q=${suggestionText}`));

		// The search box should also contain the clicked suggestion
		await expect(searchBox).toHaveValue(suggestionText);
	});

	test('should search for the keyboard-selected suggestion from dropdown, not the partial typed text', async ({
		page,
	}) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Type a partial word to trigger autocomplete (e.g., "snif" for "sniff")
		const partialText = 'snif';
		await searchBox.fill(partialText);

		// Wait for autocomplete dropdown to appear
		const autocompleteListbox = page.locator('[role="listbox"]');
		await expect(autocompleteListbox).toBeVisible({ timeout: 2000 });

		// Get the first suggestion text before selecting it
		const firstSuggestion = page.locator('[role="option"]').first();
		await expect(firstSuggestion).toBeVisible();
		const suggestionText = (await firstSuggestion.textContent()) || '';
		console.log(`Using keyboard to select suggestion: "${suggestionText}" (typed partial text was: "${partialText}")`);

		// Use keyboard to navigate down to first suggestion
		await searchBox.press('ArrowDown');
		await page.waitForTimeout(200); // Let the selection highlight

		// Press Enter to select the highlighted suggestion
		await searchBox.press('Enter');

		// Wait for URL updates to settle
		await page.waitForTimeout(1500);

		// Check final URL
		const finalUrl = page.url();
		const searchBoxValue = await searchBox.inputValue();
		console.log(`Final URL after keyboard selection: ${finalUrl}`);
		console.log(`Search box value: "${searchBoxValue}"`);

		// The final URL should be correct (contains the selected suggestion)
		await expect(page).toHaveURL(new RegExp(`q=${suggestionText}`));

		// Verify there's only ONE history entry (no double-commit bug)
		// Go back once - should return to homepage, not intermediate "snif" state
		await page.goBack();

		// Wait for navigation to complete
		await page.waitForLoadState('networkidle');

		const previousUrl = page.url();
		console.log(`URL after going back: ${previousUrl}`);
		console.log(`Expected to go back to homepage (no double commit)`);

		// After going back once, we should be at the homepage (no search params)
		// Not at the intermediate "snif" state (which would indicate double-commit bug)
		await expect(page).toHaveURL(/#\/$/); // Should match URLs ending with #/
		await expect(page).not.toHaveURL(/\?q=/); // Should not have query params
	});
});
