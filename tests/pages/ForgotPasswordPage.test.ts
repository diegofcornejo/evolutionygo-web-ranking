/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';
import { experimental_AstroContainer } from 'astro/container';

vi.mock('@layouts/Layout.astro', async () => ({
  default: (await import('../__mocks__/Layout.astro')).default,
}));

describe('forgot-password.astro page', () => {
  it('renders the forgot password title', async () => {
    const ForgotPasswordPage = (await import('../../src/pages/forgot-password.astro')).default;

    const container = await experimental_AstroContainer.create();
    const result = await container.renderToString(ForgotPasswordPage);

    expect(result).toContain('Forgot Password');
    expect(result).toContain('text-gradient');
  });
});
