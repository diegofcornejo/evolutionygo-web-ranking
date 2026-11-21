import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PodiumVortex from '@components/PodiumVortex';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PodiumVortex', () => {
  it('draws a decorative swirl that screen readers and clicks ignore', () => {
    const { container } = render(<PodiumVortex />);
    const vortex = container.querySelector('[data-podium-vortex]')!;

    expect(vortex).toHaveAttribute('aria-hidden', 'true');
    expect(vortex).toHaveClass('pointer-events-none');
    expect(vortex.querySelectorAll('[data-vortex-arms] path').length).toBeGreaterThanOrEqual(6);
    expect(vortex.querySelector('[data-vortex-bands]')).not.toBeNull();
    expect(vortex.querySelector('[data-vortex-core]')).not.toBeNull();
  });

  it('spins the bands and arms, in opposite directions', () => {
    const { container } = render(<PodiumVortex />);
    const vortex = container.querySelector('[data-podium-vortex]')!;

    expect(vortex).toHaveAttribute('data-motion', 'spin');
    expect(vortex.querySelector('[data-vortex-arms]')).toHaveClass('animate-vortex');
    expect(vortex.querySelector('[data-vortex-bands]')).toHaveClass('animate-vortex-reverse');
  });

  it('holds still for reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    );
    const { container } = render(<PodiumVortex />);
    const vortex = container.querySelector('[data-podium-vortex]')!;

    expect(vortex).toHaveAttribute('data-motion', 'still');
    expect(vortex.querySelector('.animate-vortex, .animate-vortex-reverse')).toBeNull();
  });
});
