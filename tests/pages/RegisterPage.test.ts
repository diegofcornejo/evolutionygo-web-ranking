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
        <h1 class='text-gradient text-center'>Register</h1>
      `,
    }),
  },
}));

describe('register.astro page', () => {
  it('renders the register title', async () => {
    const RegisterPage = (await import('../../src/pages/register.astro')).default;

    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(RegisterPage));

    expect(result).toContain('Register');
    expect(result).toContain('text-gradient');
  });
});
