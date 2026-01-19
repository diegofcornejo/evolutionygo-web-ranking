/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';

Object.defineProperty(import.meta, 'env', {
  value: {
    PUBLIC_API_URL: 'https://api.test.local',
  },
  writable: true,
});

const astroStub = {
  url: new URL('https://evolutionygo.com/reset-password?token=token-123'),
};

Object.defineProperty(globalThis, 'Astro', {
  value: astroStub,
  writable: true,
});

vi.spyOn(global, 'fetch').mockResolvedValue({
  ok: true,
  json: async () => ({ valid: false, message: 'Invalid' }),
} as Response);

vi.mock('@layouts/Layout.astro', () => ({
  default: () => '',
}));

vi.mock('@components/Auth', () => ({
  ResetPasswordForm: () => '',
}));

vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: async () => `
        <h1>Reset Password</h1>
        <h2>Invalid Token</h2>
        <a href="/forgot-password">Request new reset link</a>
      `,
    }),
  },
}));

describe('reset-password.astro page', () => {
  it('renders reset password content', async () => {
    const ResetPasswordPage = (await import('../../src/pages/reset-password.astro')).default;

    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(ResetPasswordPage));

    expect(result).toContain('Reset Password');
    expect(result).toContain('Invalid Token');
    expect(result).toContain('Request new reset link');
  });
});
