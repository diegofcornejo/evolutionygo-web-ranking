/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [
		require('daisyui'),
		require('@tailwindcss/typography'),
	],
	safelist: [
		'w-8',
		'w-12',
		'w-16',
		'w-24',
		'ring-primary', 
		'ring-secondary', 
		'ring-accent'],
}
