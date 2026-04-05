import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E tests
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './e2e',
	outputDir: './testing/playwright-results',

	// Maximum time one test can run - increased for data loading
	timeout: 60 * 1000,

	// Run tests in files in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry on CI only
	retries: process.env.CI ? 2 : 0,

	// Reporter to use
	reporter: [['html', { open: 'never', outputFolder: 'testing/playwright-report' }]],

	// Shared settings for all the projects below
	use: {
		// Base URL to use in actions like `await page.goto('/')`
		baseURL: 'https://localhost:5173',

		// Collect trace only on first retry to debug flaky tests
		trace: 'on-first-retry',

		// Screenshot only on failures to reduce overhead
		screenshot: 'only-on-failure',

		// Record video only on failures
		video: 'retain-on-failure',

		// Increased timeouts for actions and navigation
		actionTimeout: 15000,
		navigationTimeout: 15000,

		// Disable CSS animations/transitions so animated panels don't cause flakiness
		reduceMotion: 'reduce',
	},

	// Configure projects for major browsers
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				// Accept self-signed certificate for local dev
				ignoreHTTPSErrors: true,
			},
		},
	],

	// Run your local dev server before starting the tests
	webServer: {
		command: 'npm run dev',
		url: 'https://localhost:5173',
		reuseExistingServer: !process.env.CI,
		ignoreHTTPSErrors: true,
		timeout: 120 * 1000,
	},
});
