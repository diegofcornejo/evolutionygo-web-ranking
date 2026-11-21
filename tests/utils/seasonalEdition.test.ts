import { describe, it, expect } from 'vitest';
import {
  formatMonthDay,
  getChristmasNights,
  getHalloweenNights,
  getMuertosNights,
  getSeasonalEdition,
  getTonightIndex,
  getWelcomedYear,
  isInChristmasWindow,
  isInHalloweenWindow,
  isInMuertosWindow,
  isInNewYearWindow,
} from '@utils/seasonalEdition';

const utc = (iso: string) => new Date(`${iso}Z`);

describe('isInHalloweenWindow', () => {
  it('opens on October 1 and closes after October 31, inclusive', () => {
    expect(isInHalloweenWindow(utc('2026-09-30T23:59:59'))).toBe(false);
    expect(isInHalloweenWindow(utc('2026-10-01T00:00:00'))).toBe(true);
    expect(isInHalloweenWindow(utc('2026-10-31T23:59:59'))).toBe(true);
    expect(isInHalloweenWindow(utc('2026-11-01T00:00:00'))).toBe(false);
  });

  it('runs again the next year with no changes', () => {
    expect(isInHalloweenWindow(utc('2027-10-20T08:00:00'))).toBe(true);
    expect(isInHalloweenWindow(utc('2027-12-20T08:00:00'))).toBe(false);
  });
});

describe('isInMuertosWindow', () => {
  it('covers November 1 and 2 only', () => {
    expect(isInMuertosWindow(utc('2026-10-31T23:59:59'))).toBe(false);
    expect(isInMuertosWindow(utc('2026-11-01T00:00:00'))).toBe(true);
    expect(isInMuertosWindow(utc('2026-11-02T23:59:59'))).toBe(true);
    expect(isInMuertosWindow(utc('2026-11-03T00:00:00'))).toBe(false);
  });
});

describe('isInChristmasWindow', () => {
  it('covers December 1 to 25', () => {
    expect(isInChristmasWindow(utc('2026-11-30T23:59:59'))).toBe(false);
    expect(isInChristmasWindow(utc('2026-12-01T00:00:00'))).toBe(true);
    expect(isInChristmasWindow(utc('2026-12-25T23:59:59'))).toBe(true);
    expect(isInChristmasWindow(utc('2026-12-26T00:00:00'))).toBe(false);
  });
});

describe('isInNewYearWindow', () => {
  it('wraps from December 26 to January 6', () => {
    expect(isInNewYearWindow(utc('2026-12-25T23:59:59'))).toBe(false);
    expect(isInNewYearWindow(utc('2026-12-26T00:00:00'))).toBe(true);
    expect(isInNewYearWindow(utc('2026-12-31T23:59:59'))).toBe(true);
    expect(isInNewYearWindow(utc('2027-01-01T00:00:00'))).toBe(true);
    expect(isInNewYearWindow(utc('2027-01-06T23:59:59'))).toBe(true);
    expect(isInNewYearWindow(utc('2027-01-07T00:00:00'))).toBe(false);
    expect(isInNewYearWindow(utc('2027-06-15T00:00:00'))).toBe(false);
  });
});

describe('getSeasonalEdition', () => {
  it('hands each part of the year to its edition', () => {
    expect(getSeasonalEdition(utc('2026-12-10T10:00:00'))).toBe('christmas');
    expect(getSeasonalEdition(utc('2026-12-28T10:00:00'))).toBe('newyear');
    expect(getSeasonalEdition(utc('2027-01-03T10:00:00'))).toBe('newyear');
    expect(getSeasonalEdition(utc('2027-01-07T10:00:00'))).toBeNull();
    expect(getSeasonalEdition(utc('2026-11-15T10:00:00'))).toBeNull();
  });

  it('follows the date when there is no override', () => {
    expect(getSeasonalEdition(utc('2026-10-25T10:00:00'))).toBe('halloween');
    expect(getSeasonalEdition(utc('2026-11-01T10:00:00'))).toBe('muertos');
    expect(getSeasonalEdition(utc('2026-11-03T10:00:00'))).toBeNull();
    expect(getSeasonalEdition(utc('2026-09-20T10:00:00'))).toBeNull();
  });

  it('lets ?edition=<name> preview one and ?edition=off hide it', () => {
    expect(getSeasonalEdition(utc('2026-09-20T10:00:00'), 'halloween')).toBe('halloween');
    expect(getSeasonalEdition(utc('2026-10-25T10:00:00'), 'muertos')).toBe('muertos');
    expect(getSeasonalEdition(utc('2026-10-25T10:00:00'), 'off')).toBeNull();
    expect(getSeasonalEdition(utc('2026-11-02T10:00:00'), 'off')).toBeNull();
  });

  it('ignores unknown override values', () => {
    expect(getSeasonalEdition(utc('2026-09-20T10:00:00'), 'easter')).toBeNull();
    expect(getSeasonalEdition(utc('2026-10-25T10:00:00'), '')).toBe('halloween');
  });
});

describe('getHalloweenNights', () => {
  const nights = getHalloweenNights(2026);

  it('lists the thirty-one nights of October', () => {
    expect(nights).toHaveLength(31);
    expect(nights[0]).toMatchObject({ month: 10, day: 1 });
    expect(nights[30]).toMatchObject({ month: 10, day: 31 });
  });

  it('marks only October 31 as Halloween', () => {
    const marked = nights.filter((night) => night.isHalloween);
    expect(marked).toEqual([{ month: 10, day: 31, isHalloween: true }]);
  });
});

describe('getMuertosNights', () => {
  it('lists November 1 and 2', () => {
    expect(getMuertosNights(2026).map(({ month, day }) => ({ month, day }))).toEqual([
      { month: 11, day: 1 },
      { month: 11, day: 2 },
    ]);
  });
});

describe('getChristmasNights', () => {
  it('lists the twenty-five nights up to Christmas', () => {
    const nights = getChristmasNights(2026);
    expect(nights).toHaveLength(25);
    expect(nights[24]).toMatchObject({ month: 12, day: 25 });
  });
});

describe('getWelcomedYear', () => {
  it('looks ahead in December and stays put in January', () => {
    expect(getWelcomedYear(utc('2026-12-28T10:00:00'))).toBe(2027);
    expect(getWelcomedYear(utc('2027-01-03T10:00:00'))).toBe(2027);
  });

  it('looks ahead when previewed outside the window', () => {
    expect(getWelcomedYear(utc('2026-11-02T10:00:00'))).toBe(2027);
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
  });

  it('returns -1 outside the window so no night is lit', () => {
    expect(getTonightIndex(nights, 9, 30)).toBe(-1);
    expect(getTonightIndex(nights, 11, 1)).toBe(-1);
  });
});
