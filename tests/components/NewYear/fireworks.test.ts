import { describe, it, expect } from 'vitest';
import { burstVelocities, countdownParts, welcomedMidnight } from '@components/NewYear/fireworks';

describe('countdownParts', () => {
  it('splits the time left into whole units', () => {
    const now = Date.UTC(2026, 11, 29, 21, 10, 5);
    const target = Date.UTC(2027, 0, 1);
    expect(countdownParts(now, target)).toEqual({ days: 2, hours: 2, minutes: 49, seconds: 55, done: false });
  });

  it('is done at and after the target', () => {
    const target = Date.UTC(2027, 0, 1);
    expect(countdownParts(target, target).done).toBe(true);
    expect(countdownParts(target + 5000, target)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  });
});

describe('welcomedMidnight', () => {
  it('points at next January 1, or this one during January', () => {
    expect(welcomedMidnight(new Date(2026, 11, 28, 15))).toEqual(new Date(2027, 0, 1));
    expect(welcomedMidnight(new Date(2026, 10, 2, 15))).toEqual(new Date(2027, 0, 1));
    expect(welcomedMidnight(new Date(2027, 0, 3, 15))).toEqual(new Date(2027, 0, 1));
  });
});

describe('burstVelocities', () => {
  it('spreads sparks all the way around within the given speed', () => {
    const velocities = burstVelocities(8, 4, () => 0.5);
    expect(velocities).toHaveLength(8);
    for (const [vx, vy] of velocities) {
      const force = Math.hypot(vx, vy);
      expect(force).toBeGreaterThan(4 * 0.55);
      expect(force).toBeLessThanOrEqual(4);
    }
    expect(velocities.some(([vx]) => vx < 0)).toBe(true);
    expect(velocities.some(([, vy]) => vy < 0)).toBe(true);
  });
});
