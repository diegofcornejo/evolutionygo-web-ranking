/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				gold: '#FFD700',
				silver: '#C0C0C0',
				bronze: '#CD7F32',
			},
		},
	},
	daisyui: {
		themes: ['night', 'dark']
	},
	plugins: [
		require('daisyui'),
		require('@tailwindcss/typography'),
	],
	safelist: [
		'rating-sm',
		'rating-md',
		'rating-lg',
		'border-gold',
		'border-silver',
		'border-bronze',
		'border-transparent',
	],
}
