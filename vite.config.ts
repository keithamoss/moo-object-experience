import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	// Load env file based on `mode` in the current working directory.
	// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
	const env = loadEnv(mode, process.cwd(), '');

	return {
		server: {
			host: true,
		},
		build: {
			outDir: 'dist',
			sourcemap: true,
			rollupOptions: {
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
			viteTsconfigPaths(),
			checker({
				typescript: true,
			}),
			// TODO: Add Sentry plugin later for error monitoring
			// sentryVitePlugin({ ... })
		],
	};
});
