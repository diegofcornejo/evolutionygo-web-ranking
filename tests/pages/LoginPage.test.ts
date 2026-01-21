/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';
import { experimental_AstroContainer } from 'astro/container';

vi.mock('@layouts/Layout.astro', async () => ({
  default: (await import('../__mocks__/Layout.astro')).default,
}));

describe('login.astro page', () => {
  it('renders the login title', async () => {
    const LoginPage = (await import('../../src/pages/login.astro')).default;

    const container = await experimental_AstroContainer.create();
    const result = await container.renderToString(LoginPage);

    expect(result).toContain('Login');
    expect(result).toContain('text-gradient');
  });
});
