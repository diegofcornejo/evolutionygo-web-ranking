import { describe, it, expect } from 'vitest';
import { shouldFall, spiralArms } from '@components/Halloween/vortex';

const click = (init: MouseEventInit = {}) => new MouseEvent('click', { button: 0, ...init });

describe('spiralArms', () => {
  it('draws evenly spaced arms that start near the centre and reach the edge', () => {
    const arms = spiralArms(6);

    expect(arms).toHaveLength(6);
    for (const d of arms) {
      const points = d.slice(1).split('L').map((point) => point.split(' ').map(Number));
      const [x0, y0] = points[0];
      const [x1, y1] = points.at(-1)!;
      expect(Math.hypot(x0, y0)).toBeCloseTo(2, 0);
      expect(Math.hypot(x1, y1)).toBeGreaterThan(90);
      expect(Math.hypot(x1, y1)).toBeLessThanOrEqual(100.1);
    }
  });
});

describe('shouldFall', () => {
  it('falls into the vortex on a plain left click', () => {
    expect(shouldFall(click(), false)).toBe(true);
  });

  it('leaves modified clicks to open a tab as usual', () => {
    for (const key of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey']) {
      expect(shouldFall(click({ [key]: true }), false)).toBe(false);
    }
    expect(shouldFall(click({ button: 1 }), false)).toBe(false);
  });

  it('skips the show under reduced motion', () => {
    expect(shouldFall(click(), true)).toBe(false);
  });
});
