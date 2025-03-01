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

// https://astro.build/config
export default defineConfig({
	integrations: [react(), icon(), playformCompress(), sitemap({
		customPages: ['https://status.evolutionygo.com']
	}), svelte(), partytown()],
	vite: {
		resolve: {
			alias: {
				'@fontsource-variable/plus-jakarta-sans': '@fontsource-variable/plus-jakarta-sans'
			}
		},

		plugins: [tailwindcss()]
	},
	site: 'https://evolutionygo.com',
	output: 'server',
	adapter: vercel()
});