import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
    },
    env: {
      PUBLIC_API_URL: 'https://api.evolutionygo.com/api/v1',
    },
    // Vitest 4 removed environmentMatchGlobs. Use projects instead to run
    // page tests (Container API) in "node" and component tests in "jsdom".
    projects: [
      {
        extends: true,
        test: {
          name: 'pages',
          environment: 'node',
          include: ['tests/pages/**/*.test.{js,ts,jsx,tsx}'],
          setupFiles: ['./tests/setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'components',
          environment: 'jsdom',
          include: [
            'tests/**/*.test.{js,ts,jsx,tsx}',
            'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
          ],
          exclude: ['tests/pages/**'],
          setupFiles: ['./tests/setup.ts', './tests/setup-text-encoder.js'],
        },
      },
    ],
  },
  resolve: {
    conditions: ['browser', 'style'],
  },
});
