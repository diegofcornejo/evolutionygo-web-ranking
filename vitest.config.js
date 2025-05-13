import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.{js,ts,jsx,tsx}', 'src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    setupFiles: ['./tests/setup-text-encoder.js'],
  },
}); 