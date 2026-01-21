/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi, afterEach } from 'vitest';
import reactRenderer from '@astrojs/react/server.js';
import { experimental_AstroContainer } from 'astro/container';

Object.defineProperty(import.meta, 'env', {
  value: {
    PUBLIC_API_URL: 'https://api.test.local',
  },
  writable: true,
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

vi.mock('@layouts/Layout.astro', async () => ({
  default: (await import('../__mocks__/Layout.astro')).default,
}));

vi.mock('@components/Auth', async () => ({
  ResetPasswordForm: (await import('../__mocks__/SimpleReact')).default,
}));

describe('reset-password.astro page', () => {
  it('renders invalid token state when validation fails', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ valid: false, message: 'Invalid' }),
    })) as unknown as typeof fetch;

    const ResetPasswordPage = (await import('../../src/pages/reset-password.astro')).default;
    const container = await experimental_AstroContainer.create();
    container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
    container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });

    const result = await container.renderToString(ResetPasswordPage, {
      request: new Request('https://evolutionygo.com/reset-password?token=token-123'),
    });

    expect(result).toContain('Invalid Token');
    expect(result).toContain('Request new reset link');
    expect(result).toContain('Invalid');
  });

  it('renders the reset form when token is valid', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ valid: true }),
    })) as unknown as typeof fetch;

    const ResetPasswordPage = (await import('../../src/pages/reset-password.astro')).default;
    const container = await experimental_AstroContainer.create();
    container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
    container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });

    const result = await container.renderToString(ResetPasswordPage, {
      request: new Request('https://evolutionygo.com/reset-password?token=token-456'),
    });

    expect(result).toContain('component-url="@components/Auth"');
    expect(result).toContain('ResetPasswordForm');
  });

  it('shows a missing token message when no token provided', async () => {
    const ResetPasswordPage = (await import('../../src/pages/reset-password.astro')).default;
    const container = await experimental_AstroContainer.create();
    container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
    container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });

    const result = await container.renderToString(ResetPasswordPage, {
      request: new Request('https://evolutionygo.com/reset-password'),
    });

    expect(result).toContain('No reset token provided.');
  });
});
