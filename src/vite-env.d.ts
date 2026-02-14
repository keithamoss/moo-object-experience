/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_GOOGLE_SHEETS_API_KEY: string;
	readonly VITE_GOOGLE_SHEET_ID: string;
	readonly BASE_URL: string;
	readonly DEV: boolean;
	readonly MODE: string;
	readonly PROD: boolean;
}

declare global {
	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}
