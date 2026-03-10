import { getViteConfig } from 'astro/config';

const astroConfig = getViteConfig({
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

// Wrap the Astro config to fix React module resolution in jsdom tests.
// Astro's vite:react-* plugins cause duplicate React module instances,
// breaking hooks. We replace them with a stub that provides the
// astro:react:opts virtual module needed by Astro container tests.
export default async (env) => {
  const resolved = typeof astroConfig === 'function' ? await astroConfig(env) : astroConfig;

  const reactPluginNames = new Set([
    'vite:react-babel',
    'vite:react-refresh',
    'vite:react-virtual-preamble',
    '@astrojs/react:opts',
    '@astrojs/react:environment',
  ]);

  resolved.plugins = [
    ...resolved.plugins.flat().filter((p) => !reactPluginNames.has(p?.name || '')),
    // Provide the astro:react:opts virtual module with default options
    {
      name: 'astro:react:opts-stub',
      resolveId(id) {
        if (id === 'astro:react:opts') return '\0astro:react:opts';
      },
      load(id) {
        if (id === '\0astro:react:opts') {
          return 'export default {}';
        }
      },
    },
  ];

  return resolved;
};
