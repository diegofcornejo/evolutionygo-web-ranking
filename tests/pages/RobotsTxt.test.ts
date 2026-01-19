import { describe, it, expect } from 'vitest';
import { GET } from '../../src/pages/robots.txt';

describe('robots.txt endpoint', () => {
  it('returns the robots.txt content', async () => {
    const response = await GET({ site: new URL('https://evolutionygo.com') } as any);
    const text = await response.text();

    expect(text).toContain('User-agent: *');
    expect(text).toContain('Disallow: /login');
    expect(text).toContain('Sitemap: https://evolutionygo.com/sitemap-index.xml');
    expect(text).toContain('Host: evolutionygo.com');
  });
});
