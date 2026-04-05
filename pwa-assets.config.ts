import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
	preset: {
		...minimal2023Preset,
		apple: {
			...minimal2023Preset.apple,
			resizeOptions: { background: '#ffffff' },
		},
		maskable: {
			...minimal2023Preset.maskable,
			resizeOptions: { background: '#ffffff' },
		},
	},
	images: ['public/favicon.svg'],
});
