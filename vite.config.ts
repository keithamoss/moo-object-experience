import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import { VitePWA } from 'vite-plugin-pwa';

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
			VitePWA({
				registerType: 'autoUpdate',
				manifest: {
					name: "Westralian People's Museum Object Experience",
					short_name: 'Museum Objects',
					description: "Search and discover objects in the Westralian People's Museum collection",
					theme_color: '#9e2a2b',
					background_color: '#ffffff',
					display: 'standalone',
					icons: [
						{ src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
						{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
						{ src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
						{ src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
					],
				},
				pwaAssets: {
					config: true,
				},
			}),
			// TODO: Add Sentry plugin later for error monitoring
			// sentryVitePlugin({ ... })
		],
	};
});
