// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import react from '@astrojs/react';

import vercel from '@astrojs/vercel/serverless';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react(), icon()],
	vite: {
		resolve: {
			alias: {
				'@fontsource-variable/plus-jakarta-sans': '@fontsource-variable/plus-jakarta-sans'
			}
		}
	},
  output: 'server',
  adapter: vercel()
});