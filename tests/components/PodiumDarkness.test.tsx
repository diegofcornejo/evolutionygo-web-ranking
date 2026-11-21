import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PodiumDarkness from '@components/PodiumDarkness';

afterEach(() => {
  vi.unstubAllGlobals();
});

const darknessOf = (container: HTMLElement) => container.querySelector('[data-podium-darkness]')!;

describe('PodiumDarkness', () => {
  it('draws decorative fog that screen readers and clicks ignore', () => {
    const { container } = render(<PodiumDarkness />);
    const darkness = darknessOf(container);

    expect(darkness).toHaveAttribute('aria-hidden', 'true');
    expect(darkness).toHaveClass('pointer-events-none');
    expect(darkness.querySelectorAll('[data-darkness-fog]')).toHaveLength(3);
    expect(darkness.querySelector('[data-darkness-mist] feTurbulence')).not.toBeNull();
    expect(darkness.querySelector('[data-darkness-glow]')).not.toBeNull();
  });

  it('drifts the fog banks and the mist, and lets the glow breathe', () => {
    const { container } = render(<PodiumDarkness />);
    const darkness = darknessOf(container);

    expect(darkness).toHaveAttribute('data-motion', 'drift');
    const fogAnimations = [...darkness.querySelectorAll('[data-darkness-fog]')].map((fog) =>
      [...fog.classList].find((name) => name.startsWith('animate-'))
    );
    expect(fogAnimations.sort()).toEqual(['animate-fog-a', 'animate-fog-b', 'animate-fog-c']);
    expect(darkness.querySelector('[data-darkness-mist]')).toHaveClass('animate-mist');
    expect(darkness.querySelector('[data-darkness-glow]')).toHaveClass('animate-glow-breathe');
  });

  it('gives each render its own mist filter id', () => {
    const { container } = render(
      <>
        <PodiumDarkness />
        <PodiumDarkness />
      </>
    );
    const ids = [...container.querySelectorAll('[data-darkness-mist] filter')].map((filter) => filter.id);

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('holds still for reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    );
    const { container } = render(<PodiumDarkness />);
    const darkness = darknessOf(container);

    expect(darkness).toHaveAttribute('data-motion', 'still');
    expect(darkness.querySelector('[class*="animate-"]')).toBeNull();
  });
});
