import { expect, test } from './fixtures';
import { setupSearchTest } from './helpers/waitHelpers';

const MOBILE_VIEWPORT = { width: 375, height: 667 };

/**
 * Navigate to an object detail page at mobile viewport so the Header is rendered.
 *
 * App.tsx wraps <Header> in <Transition mounted={!isHomepage}>, so the header
 * is only present when the user is NOT on the homepage route.  Object detail
 * pages always show the header; we use that as our test surface.
 */
async function goToObjectDetailMobile(page: Parameters<typeof setupSearchTest>[0]) {
	await page.setViewportSize(MOBILE_VIEWPORT);
	const searchBox = await setupSearchTest(page);

	await searchBox.fill('department');
	await searchBox.press('Enter');
	await page.waitForURL(/\?q=department/, { timeout: 5000 });

	await page.getByTestId('result-card').first().click();
	await page.waitForURL(/\/object\/.+/, { timeout: 5000 });

	// Wait for the page-level h1 so we know the detail page has rendered
	await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });
}

/**
 * E2E tests for the Header component — mobile navigation (Burger + Drawer).
 *
 * The Header uses Mantine `Burger` (hiddenFrom="xs") and `Drawer` (hiddenFrom="xs").
 * At mobile viewport (<576 px) the Burger is visible and tapping it opens the Drawer.
 */
test.describe('Header — Mobile navigation', () => {
	test('should show the Burger button at mobile viewport and keep the Drawer closed initially', async ({ page }) => {
		await goToObjectDetailMobile(page);

		const burger = page.getByRole('button', { name: 'Toggle navigation', exact: true });
		await expect(burger).toBeVisible();

		// Navigation Drawer must be closed on first load
		await expect(page.getByRole('dialog')).not.toBeVisible();
	});

	test('should open the navigation Drawer when the Burger is clicked', async ({ page }) => {
		await goToObjectDetailMobile(page);

		await page.getByRole('button', { name: 'Toggle navigation', exact: true }).click();

		// Mantine Drawer renders as role="dialog" and shows the title prop
		const drawer = page.getByRole('dialog');
		await expect(drawer).toBeVisible({ timeout: 2000 });
		await expect(drawer.getByText('Navigation')).toBeVisible();
	});

	test('should dismiss the Drawer when pressing Escape', async ({ page }) => {
		await goToObjectDetailMobile(page);

		// Open the Drawer
		await page.getByRole('button', { name: 'Toggle navigation', exact: true }).click();
		const drawer = page.getByRole('dialog');
		await expect(drawer).toBeVisible({ timeout: 2000 });

		// Pressing Escape should close it (Mantine Drawer supports this by default)
		await page.keyboard.press('Escape');
		await expect(drawer).not.toBeVisible({ timeout: 2000 });
	});
});
