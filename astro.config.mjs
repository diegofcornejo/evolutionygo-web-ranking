// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import vercel from '@astrojs/vercel';

import icon from 'astro-icon';

import playformCompress from '@playform/compress';

import sitemap from '@astrojs/sitemap';

import svelte from '@astrojs/svelte';

import partytown from '@astrojs/partytown';

import tailwindcss from '@tailwindcss/vite';

// Pages to exclude from sitemap (private/auth pages)
const EXCLUDED_PAGES = new Set([
	'https://evolutionygo.com/login/',
	'https://evolutionygo.com/register/',
	'https://evolutionygo.com/forgot-password/',
	'https://evolutionygo.com/reset-password/',
	'https://evolutionygo.com/404/',
]);

// https://astro.build/config
export default defineConfig({
	integrations: [
		react(),
		icon(),
		playformCompress(),
		sitemap({
			// Filter out auth/private pages from sitemap
			filter: (page) => !EXCLUDED_PAGES.has(page),
			// Set global defaults
			changefreq: 'weekly',
			priority: 0.7,
			lastmod: new Date(),
		}),
		svelte(),
		partytown(),
	],
	vite: {
		resolve: {
			alias: {
				'@fontsource-variable/plus-jakarta-sans': '@fontsource-variable/plus-jakarta-sans'
			}
		},
		plugins: [/** @type {any} */ (tailwindcss())],
	},
	site: 'https://evolutionygo.com',
	output: 'server',
	adapter: vercel()
});