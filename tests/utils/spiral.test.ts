import { describe, it, expect } from 'vitest';
import { spiralArms } from '@utils/spiral';
import { spiralArms as halloweenSpiralArms } from '@components/Halloween/vortex';

describe('spiralArms', () => {
  it('draws one SVG path per arm, starting near the origin', () => {
    const arms = spiralArms(6);

    expect(arms).toHaveLength(6);
    arms.forEach((arm) => expect(arm.startsWith('M')).toBe(true));
  });

  it('is the same spiral the Halloween vortex uses', () => {
    expect(halloweenSpiralArms(6)).toEqual(spiralArms(6));
  });
});
