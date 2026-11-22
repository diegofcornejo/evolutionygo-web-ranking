import { describe, it, expect, vi, afterEach } from 'vitest';
import sharp from 'sharp';
import { seasonCardPath } from '../../src/utils/ogImage';

const loadEndpoint = () => import('../../src/pages/og/season-[season].png');

describe('season share card', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('builds the card URL from the season and the card version', () => {
    expect(seasonCardPath('7')).toBe('/og/season-7.png?v=1');
  });

  it('prerenders only the current season', async () => {
    vi.stubEnv('PUBLIC_DEFAULT_SEASON', '7');
    const { getStaticPaths, prerender } = await loadEndpoint();

    expect(prerender).toBe(true);
    expect(getStaticPaths()).toEqual([{ params: { season: '7' } }]);
  });

  it('fails the build when PUBLIC_DEFAULT_SEASON is missing', async () => {
    vi.stubEnv('PUBLIC_DEFAULT_SEASON', '');
    const { getStaticPaths } = await loadEndpoint();

    expect(() => getStaticPaths()).toThrow('PUBLIC_DEFAULT_SEASON');
  });

  it.each(['8 ', 'Season 8', '-1', '7.5'])('rejects a season that is not a whole number: %j', async (season) => {
    vi.stubEnv('PUBLIC_DEFAULT_SEASON', season);
    const { getStaticPaths } = await loadEndpoint();

    expect(() => getStaticPaths()).toThrow('PUBLIC_DEFAULT_SEASON');
  });

  it.each(['7', '10'])('serves a 1200x630 PNG under 300 KB for season %s', async (season) => {
    const { GET } = await loadEndpoint();
    const response = await GET({ params: { season } } as any);

    expect(response.headers.get('Content-Type')).toBe('image/png');
    const bytes = Buffer.from(await response.arrayBuffer());
    const meta = await sharp(bytes).metadata();
    expect(meta.format).toBe('png');
    expect([meta.width, meta.height]).toEqual([1200, 630]);
    expect(bytes.length).toBeLessThan(300_000);
  }, 20_000);
});
