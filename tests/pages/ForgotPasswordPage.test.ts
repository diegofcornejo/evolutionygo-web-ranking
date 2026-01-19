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
        <h1 class='text-gradient text-center'>Forgot Password</h1>
      `,
    }),
  },
}));

describe('forgot-password.astro page', () => {
  it('renders the forgot password title', async () => {
    const ForgotPasswordPage = (await import('../../src/pages/forgot-password.astro')).default;

    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(ForgotPasswordPage));

    expect(result).toContain('Forgot Password');
    expect(result).toContain('text-gradient');
  });
});
