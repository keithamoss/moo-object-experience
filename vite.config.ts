import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the current working directory.
	// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
	const _env = loadEnv(mode, process.cwd(), '');

	return {
		server: {
			host: true,
		},
		resolve: {
			tsconfigPaths: true,
		},
		build: {
			outDir: 'dist',
			sourcemap: true,
			rolldownOptions: {
				output: {
					manualChunks(id: string) {
						// Creating a chunk for third-party packages
						if (id.includes('/node_modules/')) {
							return 'vendor';
						}
					},
				},
			},
		},
		plugins: [
			basicSsl(),
			react(),
			checker({
				typescript: true,
			}),
			// TODO: Add Sentry plugin later for error monitoring
			// sentryVitePlugin({ ... })
		],
	};
});
