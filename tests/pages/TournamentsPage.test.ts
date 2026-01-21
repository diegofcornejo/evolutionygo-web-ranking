/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi, afterEach } from 'vitest';
import { experimental_AstroContainer } from 'astro/container';

Object.defineProperty(import.meta, 'env', {
  value: {
    PUBLIC_DEFAULT_SEASON: '6',
    PUBLIC_API_URL: 'https://api.test.local/api/v1',
  },
  writable: true,
});

const mockBanlists = [
  '2005.04 GOAT',
  '2010.03 Edison',
  '2014.04 HAT',
  '2025.10 OCG',
  '2025.10 TCG',
  '2025.10 Traditional',
  '2026.01 OCG',
  '2026.01.01 Rush Prereleases',
  'Genesys',
];

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

vi.mock('@layouts/Layout.astro', async () => import('../__mocks__/Layout.astro'));

describe('tournaments/index.astro page', () => {
  it('renders tournament cards with filters', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => mockBanlists,
    })) as unknown as typeof fetch;

    const TournamentsPage = (await import('../../src/pages/tournaments/index.astro')).default;
    const container = await experimental_AstroContainer.create();
    const result = await container.renderToString(TournamentsPage);

    expect(result).toContain('Tournaments');
    expect(result).toContain('Filters');
    expect(result).toContain('All seasons');
    expect(result).toContain('All banlists');
    expect(result).toContain('All Statuses');
    expect(result).toContain('All Privacy');
    expect(result).toContain('Enter tournament');
    expect(result).toContain('data-tournament-card');
    expect(result).toContain('data-status="closed"');
    expect(result).toContain('data-privacy="private"');
    expect(result).toContain('data-banlist="2014.04 HAT"');
  });

  it('falls back to tournament banlists when API has none', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ['N/A', 'Global'],
    })) as unknown as typeof fetch;

    const TournamentsPage = (await import('../../src/pages/tournaments/index.astro')).default;
    const container = await experimental_AstroContainer.create();
    const result = await container.renderToString(TournamentsPage);

    expect(result).toContain('All banlists');
    expect(result).toContain('2025.10 TCG');
  });

  it('handles a non-ok banlist response', async () => {
    global.fetch = vi.fn(async () => ({
      ok: false,
      json: async () => mockBanlists,
    })) as unknown as typeof fetch;

    const TournamentsPage = (await import('../../src/pages/tournaments/index.astro')).default;
    const container = await experimental_AstroContainer.create();
    const result = await container.renderToString(TournamentsPage);

    expect(result).toContain('All banlists');
    expect(result).toContain('2026.01 OCG');
  });

  it('handles banlist fetch errors gracefully', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('Network error');
    }) as unknown as typeof fetch;

    const TournamentsPage = (await import('../../src/pages/tournaments/index.astro')).default;
    const container = await experimental_AstroContainer.create();
    const result = await container.renderToString(TournamentsPage);

    expect(result).toContain('All banlists');
    expect(result).toContain('2005.04 GOAT');
  });
});
