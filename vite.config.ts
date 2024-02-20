import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {internalIpV4} from 'internal-ip';

const mobile
  = process.env.TAURI_PLATFORM === 'android'
  || process.env.TAURI_PLATFORM === 'ios';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [react()],

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	// prevent vite from obscuring rust errors
	clearScreen: false,
	// Tauri expects a fixed port, fail if that port is not available
	server: {
		host: '0.0.0.0',
		port: 1420,
		hmr: {
			protocol: 'ws',
			host: await internalIpV4(),
			port: 1421,
		},
		strictPort: true,
	},
	// To make use of `TAURI_DEBUG` and other env variables
	// https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
	envPrefix: ['VITE_', 'TAURI_'],
	build: {
		// Tauri supports es2021
		target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
		// Don't minify for debug builds
		minify: process.env.TAURI_DEBUG ? false : 'esbuild',
		// Produce sourcemaps for debug builds
		sourcemap: Boolean(process.env.TAURI_DEBUG),
	},
}));
