import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PodiumDarkness, { PodiumGlow } from '@components/PodiumDarkness';

afterEach(() => {
  vi.unstubAllGlobals();
});

const reduceMotion = () =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  );

const darknessOf = (container: HTMLElement) => container.querySelector('[data-podium-darkness]')!;

describe('PodiumDarkness', () => {
  it('draws decorative fog that screen readers and clicks ignore', () => {
    const { container } = render(<PodiumDarkness />);
    const darkness = darknessOf(container);

    expect(darkness).toHaveAttribute('aria-hidden', 'true');
    expect(darkness).toHaveClass('pointer-events-none');
    expect(darkness.querySelectorAll('[data-darkness-fog]')).toHaveLength(3);
    expect(darkness.querySelector('[data-darkness-mist] feTurbulence')).not.toBeNull();
  });

  it('pins the darkness to the viewport and shows it only through the panel, with soft edges', () => {
    const { container } = render(<PodiumDarkness />);
    const darkness = darknessOf(container);
    const veil = darkness.querySelector('[data-darkness-veil]')!;

    // Covers the whole panel, edge to edge, and clips the fixed layer to it.
    expect(darkness).toHaveClass('absolute', 'inset-y-0', '-inset-x-4', '[clip-path:inset(0)]');
    expect(darkness.className).toContain('[mask-image:');
    expect(veil).toHaveClass('fixed', 'inset-0');
    expect(veil.querySelectorAll('[data-darkness-fog]')).toHaveLength(3);
  });

  it('makes the mist wide enough that its drift never shows an edge', () => {
    const { container } = render(<PodiumDarkness />);

    // 150% wide from -25%, drifting ±8% of itself (see mist-drift in global.css): always past both edges.
    expect(darknessOf(container).querySelector('[data-darkness-mist]')).toHaveClass('-left-[25%]', 'w-[150%]');
  });

  it('drifts the fog banks and the mist', () => {
    const { container } = render(<PodiumDarkness />);
    const darkness = darknessOf(container);

    expect(darkness).toHaveAttribute('data-motion', 'drift');
    const fogAnimations = [...darkness.querySelectorAll('[data-darkness-fog]')].map((fog) =>
      [...fog.classList].find((name) => name.startsWith('animate-'))
    );
    expect(fogAnimations.sort()).toEqual(['animate-fog-a', 'animate-fog-b', 'animate-fog-c']);
    expect(darkness.querySelector('[data-darkness-mist]')).toHaveClass('animate-mist');
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
    reduceMotion();
    const { container } = render(<PodiumDarkness />);
    const darkness = darknessOf(container);

    expect(darkness).toHaveAttribute('data-motion', 'still');
    expect(darkness.querySelector('[class*="animate-"]')).toBeNull();
  });
});

describe('PodiumGlow', () => {
  it('breathes behind the first card, ignored by screen readers and clicks', () => {
    const { container } = render(<PodiumGlow />);
    const glow = container.querySelector('[data-podium-glow]')!;

    expect(glow).toHaveAttribute('aria-hidden', 'true');
    expect(glow).toHaveClass('pointer-events-none', 'animate-glow-breathe');
  });

  it('holds still for reduced motion', () => {
    reduceMotion();
    const { container } = render(<PodiumGlow />);

    expect(container.querySelector('[data-podium-glow]')).not.toHaveClass('animate-glow-breathe');
  });
});
