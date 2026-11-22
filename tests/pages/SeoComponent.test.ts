import { describe, it, expect, vi, afterEach } from 'vitest';
import { experimental_AstroContainer } from 'astro/container';

const renderSeo = async (props: Record<string, unknown> = {}) => {
  vi.stubEnv('PUBLIC_DEFAULT_SEASON', '7');
  const SEO = (await import('../../src/components/SEO.astro')).default;
  const container = await experimental_AstroContainer.create({ astroConfig: { site: 'https://evolutionygo.com' } } as any);
  return container.renderToString(SEO, {
    props: { title: 'Evolution YGO Season 7', ...props },
    request: new Request('https://evolutionygo.com/'),
  });
};

const metaContent = (html: string, attr: 'property' | 'name', key: string) =>
  html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1];

describe('SEO share image', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses the season card when no image is given', async () => {
    const html = await renderSeo();

    expect(metaContent(html, 'property', 'og:image')).toBe('https://evolutionygo.com/og/season-7.png?v=1');
    expect(metaContent(html, 'name', 'twitter:image')).toBe('https://evolutionygo.com/og/season-7.png?v=1');
    expect(metaContent(html, 'property', 'og:image:type')).toBe('image/png');
    expect(metaContent(html, 'property', 'og:image:width')).toBe('1200');
    expect(metaContent(html, 'property', 'og:image:height')).toBe('630');
  });

  it("keeps a page's own image", async () => {
    const avatar = 'https://ui-avatars.com/api/?name=x&size=512';
    const html = await renderSeo({ image: avatar });

    expect(metaContent(html, 'property', 'og:image')).toBe(avatar.replace(/&/g, '&amp;'));
    expect(html).not.toContain('og:image:type');
    expect(html).not.toContain('og:image:width');
    expect(html).not.toContain('og:image:height');
  });

  it('says YGO, not Yu-Gi-Oh, in descriptions', async () => {
    const html = await renderSeo();

    expect(metaContent(html, 'property', 'og:description')).not.toContain('Yu-Gi-Oh');
    const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
    expect(jsonLd).toContain('"description"');
    expect(jsonLd).not.toMatch(/"description":"[^"]*Yu-Gi-Oh/);
  });
});
