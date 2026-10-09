import { describe, it, expect } from 'vitest';
import {
  formatMonthDay,
  getHalloweenNights,
  getSeasonalEdition,
  getTonightIndex,
  isInHalloweenWindow,
} from '@utils/seasonalEdition';

const utc = (iso: string) => new Date(`${iso}Z`);

describe('isInHalloweenWindow', () => {
  it('opens on October 1 and closes after November 2, inclusive', () => {
    expect(isInHalloweenWindow(utc('2026-09-30T23:59:59'))).toBe(false);
    expect(isInHalloweenWindow(utc('2026-10-01T00:00:00'))).toBe(true);
    expect(isInHalloweenWindow(utc('2026-10-31T12:00:00'))).toBe(true);
    expect(isInHalloweenWindow(utc('2026-11-02T23:59:59'))).toBe(true);
    expect(isInHalloweenWindow(utc('2026-11-03T00:00:00'))).toBe(false);
  });

  it('runs again the next year with no changes', () => {
    expect(isInHalloweenWindow(utc('2027-10-20T08:00:00'))).toBe(true);
    expect(isInHalloweenWindow(utc('2027-12-20T08:00:00'))).toBe(false);
  });
});

describe('getSeasonalEdition', () => {
  it('follows the date when there is no override', () => {
    expect(getSeasonalEdition(utc('2026-10-25T10:00:00'))).toBe('halloween');
    expect(getSeasonalEdition(utc('2026-09-20T10:00:00'))).toBeNull();
  });

  it('lets ?edition=halloween preview it and ?edition=off hide it', () => {
    expect(getSeasonalEdition(utc('2026-09-20T10:00:00'), 'halloween')).toBe('halloween');
    expect(getSeasonalEdition(utc('2026-10-25T10:00:00'), 'off')).toBeNull();
  });

  it('ignores unknown override values', () => {
    expect(getSeasonalEdition(utc('2026-09-20T10:00:00'), 'christmas')).toBeNull();
    expect(getSeasonalEdition(utc('2026-10-25T10:00:00'), '')).toBe('halloween');
  });
});

describe('getHalloweenNights', () => {
  const nights = getHalloweenNights(2026);

  it('lists the thirty-three nights from October 1 to November 2', () => {
    expect(nights).toHaveLength(33);
    expect(nights[0]).toMatchObject({ month: 10, day: 1 });
    expect(nights[32]).toMatchObject({ month: 11, day: 2 });
  });

  it('marks only October 31 as Halloween', () => {
    const marked = nights.filter((night) => night.isHalloween);
    expect(marked).toEqual([{ month: 10, day: 31, isHalloween: true }]);
  });
});

describe('formatMonthDay', () => {
  it('names the month in English', () => {
    expect(formatMonthDay({ month: 10, day: 1 })).toBe('October 1');
    expect(formatMonthDay({ month: 11, day: 2 })).toBe('November 2');
  });
});

describe('getTonightIndex', () => {
  const nights = getHalloweenNights(2026);

  it('finds tonight inside the window', () => {
    expect(getTonightIndex(nights, 10, 1)).toBe(0);
    expect(getTonightIndex(nights, 10, 31)).toBe(30);
    expect(getTonightIndex(nights, 11, 2)).toBe(32);
  });

  it('returns -1 outside the window so no night is lit', () => {
    expect(getTonightIndex(nights, 9, 30)).toBe(-1);
    expect(getTonightIndex(nights, 11, 3)).toBe(-1);
  });
});
