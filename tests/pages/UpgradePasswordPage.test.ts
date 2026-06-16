/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, afterEach, vi } from 'vitest';
import reactRenderer from '@astrojs/react/server.js';
import { experimental_AstroContainer } from 'astro/container';

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

vi.mock('@layouts/Layout.astro', async () => ({
  default: (await import('../__mocks__/Layout.astro')).default,
}));

vi.mock('@components/Auth/UpgradePasswordForm', async () => ({
  UpgradePasswordForm: (await import('../__mocks__/SimpleReact')).default,
}));

async function renderUpgradePage() {
  const UpgradePasswordPage = (await import('../../src/pages/upgrade-password.astro')).default;
  const container = await experimental_AstroContainer.create();
  container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
  container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });
  return container.renderToString(UpgradePasswordPage, {
    request: new Request('https://evolutionygo.com/upgrade-password'),
  });
}

describe('upgrade-password.astro page', () => {
  it('frames the screen as an account-security action, not a bare prompt', async () => {
    const result = await renderUpgradePage();
    expect(result).toContain('Account security');
    expect(result).toContain('Secure your account');
  });

  it('explains what happens to the legacy PIN and that the account is preserved', async () => {
    const result = await renderUpgradePage();
    // The PIN is kept as the game password, the new password is for the web,
    // and identity/stats are not lost — the reassurance that was missing.
    expect(result).toContain('game password');
    expect(result).toContain('identity and stats stay the same');
  });

  it('mounts the upgrade form', async () => {
    const result = await renderUpgradePage();
    expect(result).toContain('UpgradePasswordForm');
  });
});
