import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.{js,ts,jsx,tsx}', 'src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    setupFiles: ['./tests/setup.ts', './tests/setup-text-encoder.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
    },
    env: {
      PUBLIC_API_URL: 'https://api.evolutionygo.com/api/v1',
    },
  },
  resolve: {
    conditions: ['browser', 'style'],
  },
}); 