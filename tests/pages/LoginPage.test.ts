/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';

vi.mock('@layouts/Layout.astro', () => ({
  default: () => '',
}));

vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: async () => `
        <h1 class='text-gradient text-center'>Login</h1>
      `,
    }),
  },
}));

describe('login.astro page', () => {
  it('renders the login title', async () => {
    const LoginPage = (await import('../../src/pages/login.astro')).default;

    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(LoginPage));

    expect(result).toContain('Login');
    expect(result).toContain('text-gradient');
  });
});
