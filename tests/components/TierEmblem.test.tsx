import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TierEmblem from '@components/TierEmblem';

const TIERS = ['rookie', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];

const paletteOf = (svg: Element) => `${svg.getAttribute('data-c1')}/${svg.getAttribute('data-c2')}`;

describe('TierEmblem', () => {
  it('renders one palette per tier', () => {
    const palettes = TIERS.map((tier) => {
      const { container } = render(<TierEmblem tier={tier} />);
      const svg = container.querySelector(`svg[data-tier-emblem="${tier}"]`)!;
      expect(svg).not.toBeNull();
      return paletteOf(svg);
    });

    expect(new Set(palettes).size).toBe(TIERS.length);
  });

  it('falls back for an unknown tier id', () => {
    const { container } = render(<TierEmblem tier="legend" />);
    const rookie = render(<TierEmblem tier="rookie" />).container.querySelector('svg')!;

    expect(paletteOf(container.querySelector('svg[data-tier-emblem="legend"]')!)).toBe(paletteOf(rookie));
  });

  it('is decorative unless titled', () => {
    const plain = render(<TierEmblem tier="gold" />).container.querySelector('svg')!;
    expect(plain).toHaveAttribute('aria-hidden', 'true');

    const titled = render(<TierEmblem tier="gold" title="Gold" />).container.querySelector('svg')!;
    expect(titled).toHaveAttribute('role', 'img');
    expect(titled).toHaveAttribute('aria-label', 'Gold');
    expect(titled).not.toHaveAttribute('aria-hidden');
  });
});
