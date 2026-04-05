import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [basicSsl(), react()],
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/vitest.setup.ts',
		css: true,
		pool: 'threads',
		exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
		reporters: ['default', 'html'],
		outputFile: {
			html: './testing/vitest-report/index.html',
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			reportsDirectory: './testing/vitest-coverage',
			exclude: [
				'**/node_modules/**',
				'**/dist/**',
				'**/e2e/**',
				'**/*.test.{ts,tsx}',
				'**/*.spec.{ts,tsx}',
				'**/vitest.setup.ts',
				'**/vite.config.ts',
				'**/vitest.config.ts',
				'**/*.d.ts',
				'**/main.tsx',
			],
			include: ['src/**/*.{ts,tsx}'],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80,
			},
		},
	},
});
