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

import maintenance from 'astro-maintenance';

import { loadEnv } from "vite";

const { MAINTENANCE_ENABLED } = loadEnv(process.env.NODE_ENV || "", process.cwd(), "");

// https://astro.build/config
export default defineConfig({
	integrations: [react(), icon(), playformCompress(), sitemap({
		customPages: ['https://status.evolutionygo.com']
	}), svelte(), partytown(), maintenance({
		enabled: MAINTENANCE_ENABLED === 'true',
		template: 'simple',
		title: 'Under Maintenance',
		description: 'We are currently performing maintenance on the site. Please check back later.',
		logo: 'logo.svg',
		socials: {
			discord: 'https://discord.com/invite/bgjddgWkWk',
			github: 'https://github.com/evolutionygo'
		}
	})],
	vite: {
		resolve: {
			alias: {
				'@fontsource-variable/plus-jakarta-sans': '@fontsource-variable/plus-jakarta-sans'
			}
		},
		// @ts-expect-error - Tailwind CSS v4 plugin type compatibility
		plugins: [tailwindcss()]
	},
	site: 'https://evolutionygo.com',
	output: 'server',
	adapter: vercel()
});