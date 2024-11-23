// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import react from '@astrojs/react';

import vercel from '@astrojs/vercel/serverless';

import icon from 'astro-icon';

import playformCompress from '@playform/compress';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	integrations: [
		tailwind(), 
		react(), 
		icon(), 
		playformCompress(), 
		sitemap({
			customPages: ['https://status.evolutionygo.com']
		})
	],
	vite: {
		resolve: {
			alias: {
				'@fontsource-variable/plus-jakarta-sans': '@fontsource-variable/plus-jakarta-sans'
			}
		}
	},
	site: 'https://evolutionygo.com',
	output: 'server',
	adapter: vercel()
});