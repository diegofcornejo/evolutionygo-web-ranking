/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';
import { experimental_AstroContainer } from 'astro/container';

vi.mock('@layouts/Layout.astro', async () => ({
  default: (await import('../__mocks__/Layout.astro')).default,
}));

describe('register.astro page', () => {
  it('renders the register title', async () => {
    const RegisterPage = (await import('../../src/pages/register.astro')).default;

    const container = await experimental_AstroContainer.create();
    const result = await container.renderToString(RegisterPage);

    expect(result).toContain('Register');
    expect(result).toContain('text-gradient');
  });
});
