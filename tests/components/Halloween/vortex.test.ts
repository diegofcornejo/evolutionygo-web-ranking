import { describe, it, expect } from 'vitest';
import { holeDiameter, shouldFall, spiralArms, swirlMap, swirlStrength } from '@components/Halloween/vortex';

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

describe('swirlMap', () => {
  const cols = 64;
  const rows = 40;
  const { pixels, scale } = swirlMap(cols, rows, 1280, 800);
  const offset = (col: number, row: number) => {
    const index = (row * cols + col) * 4;
    return [(pixels[index] / 255 - 0.5) * scale, (pixels[index + 1] / 255 - 0.5) * scale];
  };

  it('leaves the corners and edges of the viewport in place', () => {
    for (const [col, row] of [[0, 0], [cols - 1, 0], [0, rows - 1], [cols - 1, rows - 1], [cols / 2, 0], [0, rows / 2]]) {
      const [dx, dy] = offset(col, row);
      expect(Math.hypot(dx, dy)).toBeLessThan(scale / 255 + 1);
    }
  });

  it('pulls from farther out near the centre, so the page is drawn inwards', () => {
    const [dx, dy] = offset(cols / 2 + 6, rows / 2);
    const x = (cols / 2 + 6.5) / cols * 1280 - 640;
    const y = (rows / 2 + 0.5) / rows * 800 - 400;
    expect(Math.hypot(x + dx, y + dy)).toBeGreaterThan(Math.hypot(x, y) * 1.5);
  });

  it('keeps every sample inside the viewport', () => {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const [dx, dy] = offset(col, row);
        const x = (col + 0.5) / cols * 1280 + dx;
        const y = (row + 0.5) / rows * 800 + dy;
        expect(x).toBeGreaterThanOrEqual(-scale / 255);
        expect(x).toBeLessThanOrEqual(1280 + scale / 255);
        expect(y).toBeGreaterThanOrEqual(-scale / 255);
        expect(y).toBeLessThanOrEqual(800 + scale / 255);
      }
    }
  });
});

describe('holeDiameter', () => {
  it('stays shut while the page starts to twist, then grows until it covers the screen', () => {
    expect(holeDiameter(0)).toBe(0);
    expect(holeDiameter(0.18)).toBe(0);
    expect(holeDiameter(0.45)).toBe(8);
    expect(holeDiameter(0.8)).toBeGreaterThan(24);
    expect(holeDiameter(0.8)).toBeLessThan(150);
  });

  it('keeps the screen covered after the hole has swallowed it', () => {
    expect(holeDiameter(0.9)).toBe(150);
    expect(holeDiameter(0.95)).toBe(150);
    expect(holeDiameter(1)).toBe(150);
  });
});

describe('swirlStrength', () => {
  it('starts gently and is complete before the void falls', () => {
    expect(swirlStrength(0)).toBe(0);
    expect(swirlStrength(0.3)).toBeLessThan(0.2);
    expect(swirlStrength(0.9)).toBe(1);
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
