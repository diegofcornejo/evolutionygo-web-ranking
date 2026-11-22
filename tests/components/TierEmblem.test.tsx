import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TierEmblem from '@components/TierEmblem';

const TIERS = ['rookie', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];

const emblem = (container: HTMLElement) => container.querySelector('img[data-tier-emblem]')!;

describe('TierEmblem', () => {
  it('draws the official art of each tier', () => {
    for (const tier of TIERS) {
      const img = emblem(render(<TierEmblem tier={tier} />).container);
      expect(img).toHaveAttribute('data-tier-emblem', tier);
      expect(img).toHaveAttribute('src', `/ranks/${tier}-64.webp`);
      expect(img.getAttribute('srcset')).toBe(
        [32, 64, 128, 256].map((size) => `/ranks/${tier}-${size}.webp ${size}w`).join(', '),
      );
    }
  });

  it('asks the browser for the size it is drawn at', () => {
    expect(emblem(render(<TierEmblem tier="gold" />).container)).toHaveAttribute('sizes', '24px');
    expect(emblem(render(<TierEmblem tier="gold" size={80} />).container)).toHaveAttribute('sizes', '80px');
  });

  it('falls back to rookie for an unknown tier id', () => {
    const img = emblem(render(<TierEmblem tier="legend" />).container);
    expect(img).toHaveAttribute('data-tier-emblem', 'legend');
    expect(img).toHaveAttribute('src', '/ranks/rookie-64.webp');
  });

  it('does not pick up object built-ins as a tier', () => {
    expect(emblem(render(<TierEmblem tier="constructor" />).container)).toHaveAttribute('src', '/ranks/rookie-64.webp');
  });

  it('is decorative unless titled', () => {
    const plain = emblem(render(<TierEmblem tier="gold" />).container);
    expect(plain).toHaveAttribute('alt', '');
    expect(plain).toHaveAttribute('aria-hidden', 'true');

    const titled = emblem(render(<TierEmblem tier="gold" title="Gold" />).container);
    expect(titled).toHaveAttribute('alt', 'Gold');
    expect(titled).not.toHaveAttribute('aria-hidden');
  });

  it('ships every size it points to', async () => {
    const { existsSync } = await import('node:fs');
    for (const tier of TIERS) {
      for (const size of [32, 64, 128, 256]) expect(existsSync(`public/ranks/${tier}-${size}.webp`), `${tier}-${size}`).toBe(true);
    }
  });
});
