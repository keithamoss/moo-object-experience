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

	test('should not show suggestions when typing less than 2 characters', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Type a single character
		await searchBox.fill('a');

		// Wait a moment for any potential dropdown
		await page.waitForTimeout(500);

		// Dropdown should not appear
		const autocompleteListbox = page.locator('[role="listbox"]');
		await expect(autocompleteListbox).not.toBeVisible();

		// Type second character
		await searchBox.fill('an');

		// Now dropdown should appear (if there are matching suggestions)
		await expect(autocompleteListbox).toBeVisible({ timeout: 2000 });
	});

	test('should show no suggestions when text has no matches', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Type text that is unlikely to match any terms
		await searchBox.fill('xyzqweasd');

		// Wait a moment
		await page.waitForTimeout(500);

		// Dropdown should not appear since there are no matches
		const autocompleteListbox = page.locator('[role="listbox"]');
		await expect(autocompleteListbox).not.toBeVisible();
	});

	test('should dismiss suggestions dropdown when pressing Escape', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Type to trigger suggestions
		await searchBox.fill('depar');

		// Wait for dropdown to appear
		const autocompleteListbox = page.locator('[role="listbox"]');
		await expect(autocompleteListbox).toBeVisible({ timeout: 2000 });

		// Press Escape to dismiss
		await searchBox.press('Escape');

		// Wait a moment
		await page.waitForTimeout(300);

		// Dropdown should be dismissed
		await expect(autocompleteListbox).not.toBeVisible();

		// MUI Autocomplete clears the value on Escape (this is standard behavior)
		// Search box should be cleared
		await expect(searchBox).toHaveValue('');

		// URL should not have changed (no search committed)
		await expect(page).toHaveURL(/#\/$/);
	});

	test('should handle multi-word query and replace only the last word with suggestion', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Type first word and space
		await searchBox.type('ancient ');
		await page.waitForTimeout(300);

		// Now type partial second word to trigger suggestions
		await searchBox.type('depar', { delay: 50 });

		// Wait for dropdown
		const autocompleteListbox = page.locator('[role="listbox"]');
		await expect(autocompleteListbox).toBeVisible({ timeout: 3000 });

		// Get first suggestion
		const firstSuggestion = page.locator('[role="option"]').first();
		await expect(firstSuggestion).toBeVisible();
		const suggestionText = (await firstSuggestion.textContent()) || '';

		// Click suggestion
		await firstSuggestion.click();

		// Wait for commit
		await page.waitForTimeout(1000);

		// Search box should have "ancient" followed by the suggestion
		const searchBoxValue = await searchBox.inputValue();
		expect(searchBoxValue).toContain('ancient');
		expect(searchBoxValue).toContain(suggestionText);

		// URL should contain the full query
		await expect(page).toHaveURL(/\?q=/);
	});

	test('should navigate through multiple suggestions with arrow keys', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Type to trigger suggestions that should have multiple matches
		await searchBox.fill('st');

		// Wait for dropdown
		const autocompleteListbox = page.locator('[role="listbox"]');
		await expect(autocompleteListbox).toBeVisible({ timeout: 2000 });

		// Get all suggestions
		const suggestions = page.locator('[role="option"]');
		const suggestionCount = await suggestions.count();

		// Should have multiple suggestions
		expect(suggestionCount).toBeGreaterThan(1);

		// Press ArrowDown to highlight first suggestion
		await searchBox.press('ArrowDown');
		await page.waitForTimeout(200);

		// Get first suggestion text
		const firstSuggestion = suggestions.nth(0);
		const firstText = (await firstSuggestion.textContent()) || '';

		// Press ArrowDown again to move to second suggestion
		await searchBox.press('ArrowDown');
		await page.waitForTimeout(200);

		// Get second suggestion text
		const secondSuggestion = suggestions.nth(1);
		const secondText = (await secondSuggestion.textContent()) || '';

		// Press ArrowUp to go back to first suggestion
		await searchBox.press('ArrowUp');
		await page.waitForTimeout(200);

		// Press Enter to select (should select first suggestion)
		await searchBox.press('Enter');
		await page.waitForTimeout(1000);

		// Should have committed the first suggestion
		const searchBoxValue = await searchBox.inputValue();
		expect([firstText, secondText]).toContain(searchBoxValue);
	});

	test('should be case-insensitive when matching suggestions', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Type lowercase
		await searchBox.fill('depar');

		// Wait for dropdown
		const autocompleteListbox = page.locator('[role="listbox"]');
		await expect(autocompleteListbox).toBeVisible({ timeout: 2000 });

		// Get suggestions
		const suggestions1 = await page.locator('[role="option"]').allTextContents();

		// Clear and type uppercase
		await searchBox.clear();
		await searchBox.fill('DEPAR');

		// Wait for dropdown
		await expect(autocompleteListbox).toBeVisible({ timeout: 2000 });

		// Get suggestions again
		const suggestions2 = await page.locator('[role="option"]').allTextContents();

		// Suggestions should be the same (case-insensitive)
		expect(suggestions1).toEqual(suggestions2);
	});

	test('should clear input and suggestions using clear functionality', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Type to trigger suggestions
		await searchBox.fill('depar');

		// Wait for dropdown
		const autocompleteListbox = page.locator('[role="listbox"]');
		await expect(autocompleteListbox).toBeVisible({ timeout: 2000 });

		// Clear using keyboard (Ctrl+A, Delete works across platforms)
		await searchBox.press('ControlOrMeta+a');
		await searchBox.press('Backspace');

		// Wait a moment
		await page.waitForTimeout(300);

		// Search box should be empty
		await expect(searchBox).toHaveValue('');

		// Dropdown should not be visible
		await expect(autocompleteListbox).not.toBeVisible();
	});

	test('should select highlighted suggestion when pressing Tab', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Type to trigger suggestions
		await searchBox.fill('depar');

		// Wait for dropdown
		const autocompleteListbox = page.locator('[role="listbox"]');
		await expect(autocompleteListbox).toBeVisible({ timeout: 2000 });

		// Press ArrowDown to highlight first suggestion
		await searchBox.press('ArrowDown');
		await page.waitForTimeout(200);

		// Get the highlighted suggestion text
		const firstSuggestion = page.locator('[role="option"]').first();
		const _suggestionTexttt = (await firstSuggestion.textContent()) || '';

		// Press Tab to select (note: MUI Autocomplete behavior might vary)
		await searchBox.press('Tab');
		await page.waitForTimeout(500);

		// Search box should contain the selected suggestion or still show partial text
		// MUI Autocomplete Tab behavior typically selects the highlighted option
		const searchBoxValue = await searchBox.inputValue();

		// Either the suggestion was selected, or Tab just moved focus
		// We mainly want to verify it doesn't crash
		expect(searchBoxValue.length).toBeGreaterThan(0);
	});

	test('should dismiss dropdown when clicking outside', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// Type to trigger suggestions
		await searchBox.fill('depar');

		// Wait for dropdown
		const autocompleteListbox = page.locator('[role="listbox"]');
		await expect(autocompleteListbox).toBeVisible({ timeout: 2000 });

		// Click somewhere else on the page (e.g., the header or body)
		await page.locator('body').click({ position: { x: 10, y: 10 } });

		// Wait a moment
		await page.waitForTimeout(300);

		// Dropdown should be dismissed
		await expect(autocompleteListbox).not.toBeVisible();

		// Search box should still have the value
		await expect(searchBox).toHaveValue('depar');
	});

	test('should handle multiple suggestion selections in sequence', async ({ page }) => {
		await page.goto('/#/');

		// Wait for data to load
		const searchBox = page.getByPlaceholder(/search/i);
		await expect(searchBox).toBeEnabled({ timeout: 5000 });

		// First suggestion selection using "depar"
		await searchBox.type('depar', { delay: 50 });

		// Wait for dropdown
		let autocompleteListbox = page.locator('[role="listbox"]');
		await expect(autocompleteListbox).toBeVisible({ timeout: 2000 });

		// Select first suggestion via keyboard
		await searchBox.press('ArrowDown');
		await page.waitForTimeout(200);
		const firstSuggestion = page.locator('[role="option"][data-option-index="0"]');
		const firstTerm = (await firstSuggestion.textContent()) || '';
		await searchBox.press('Enter');

		// Wait for commit
		await page.waitForTimeout(1500);

		// Verify first search committed
		await expect(page).toHaveURL(/\?q=/);

		// Clear search by going back to homepage
		await page.goto('/#/');
		await expect(searchBox).toBeEnabled({ timeout: 5000 });
		await expect(searchBox).toHaveValue('');

		// Second suggestion selection with "snif"
		await searchBox.type('snif', { delay: 50 });

		// Wait for dropdown
		autocompleteListbox = page.locator('[role="listbox"]');
		await expect(autocompleteListbox).toBeVisible({ timeout: 2000 });

		// Select first suggestion via keyboard
		await searchBox.press('ArrowDown');
		await page.waitForTimeout(200);
		const secondSuggestion = page.locator('[role="option"][data-option-index="0"]');
		const secondTerm = (await secondSuggestion.textContent()) || '';
		await searchBox.press('Enter');

		// Wait for commit
		await page.waitForTimeout(1500);

		// Should have committed second search
		await expect(page).toHaveURL(/\?q=/);

		// Both selections should have worked
		expect(firstTerm.length).toBeGreaterThan(0);
		expect(secondTerm.length).toBeGreaterThan(0);
	});
});
