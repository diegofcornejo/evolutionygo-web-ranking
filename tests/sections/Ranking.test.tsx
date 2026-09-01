import { render, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Duelist } from '@types';
import Ranking from '@sections/Ranking';

vi.mock('@stores/sessionStore', () => ({
  getSession: vi.fn(() => ({ isLoggedIn: false })),
}));

const API_URL = 'https://api.test.local';

const groupedBanLists = [
  { name: 'Global', type: 'global', banLists: [] },
  { name: 'TCG', type: 'group', banLists: ['2024.04 TCG', '2024.07 TCG'] },
  { name: 'Goat Format', type: 'banlist', banLists: [] },
];

const flatBanLists = ['Global', '2024.04 TCG', 'N/A'];

const buildDuelist = (overrides: Partial<Duelist> & { userId: string }): Duelist => ({
  username: `Duelist ${overrides.userId}`,
  points: 100,
  wins: 10,
  losses: 5,
  winRate: 66.67,
  position: 1,
  ...overrides,
});

// The first four entries are rendered as cards, the rest as table rows.
const cardDuelists = ['1', '2', '3', '4'].map((userId) => buildDuelist({ userId }));

const tableDuelists: Duelist[] = [
  buildDuelist({ userId: '5', username: 'RatedDuelist', position: 5, rating: 1543.6, provisional: false }),
  buildDuelist({ userId: '6', username: 'NewDuelist', position: 6, rating: 1210.2, provisional: true }),
  buildDuelist({ userId: '7', username: 'UnratedDuelist', position: 7, rating: null }),
];

const jsonResponse = (data: unknown) => ({
  ok: true,
  status: 200,
  json: async () => data,
});

type FetchOverrides = {
  grouped?: () => Promise<unknown>;
  flat?: unknown;
  stats?: Duelist[];
};

const mockFetch = ({ grouped, flat = flatBanLists, stats = [] }: FetchOverrides = {}) => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/ban-lists/grouped')) {
      return grouped ? await grouped() : jsonResponse(groupedBanLists);
    }
    if (url.includes('/ban-lists')) {
      return jsonResponse(flat);
    }
    if (url.includes('/stats')) {
      return jsonResponse(stats);
    }
    throw new Error(`Unexpected request: ${url}`);
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const banListSelect = (container: HTMLElement) =>
  container.querySelector<HTMLSelectElement>('select[aria-label="Filter by banlist"]')!;

const banListChipRow = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[aria-label^="Ban lists in"]');

const chipNames = (row: HTMLElement) =>
  Array.from(row.querySelectorAll('button')).map(
    (chip) => chip.getAttribute('aria-label') ?? chip.textContent
  );

describe('Ranking', () => {
  beforeEach(() => {
    vi.stubEnv('PUBLIC_API_URL', API_URL);
    vi.stubEnv('PUBLIC_DEFAULT_SEASON', '3');
    vi.stubEnv('PUBLIC_DEFAULT_BAN_LIST', 'Global');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('ban list selector', () => {
    it('lists formats and orphan ban lists, never the members of a group', async () => {
      mockFetch();

      const { container } = render(<Ranking />);

      await waitFor(() => {
        expect(banListSelect(container).querySelectorAll('option')).toHaveLength(3);
      });

      const select = banListSelect(container);
      expect(Array.from(select.querySelectorAll('option')).map((option) => option.value)).toEqual([
        'Global',
        'TCG',
        'Goat Format',
      ]);
      expect(select.querySelector('optgroup')).toBeNull();
    });

    it('renders no member chips while the selected entry has no member ban list', async () => {
      mockFetch();

      const { container } = render(<Ranking />);

      await waitFor(() => {
        expect(banListSelect(container).querySelectorAll('option')).toHaveLength(3);
      });

      expect(banListChipRow(container)).toBeNull();
    });

    it('renders the member chips of the selected format, led by the format ladder itself', async () => {
      mockFetch();

      const { container } = render(<Ranking />);

      await waitFor(() => {
        expect(banListSelect(container).querySelectorAll('option')).toHaveLength(3);
      });

      fireEvent.change(banListSelect(container), { target: { value: 'TCG' } });

      await waitFor(() => {
        expect(banListChipRow(container)).not.toBeNull();
      });

      const row = banListChipRow(container)!;
      expect(row.getAttribute('aria-label')).toBe('Ban lists in TCG');
      expect(chipNames(row)).toEqual(['All TCG', '2024.04 TCG', '2024.07 TCG']);

      const chips = Array.from(row.querySelectorAll('button'));
      expect(chips.map((chip) => chip.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);
    });

    it('refetches the leaderboard with the clicked member ban list, keeping the format selected', async () => {
      const fetchMock = mockFetch();

      const { container } = render(<Ranking />);

      await waitFor(() => {
        expect(banListSelect(container).querySelectorAll('option')).toHaveLength(3);
      });

      fireEvent.change(banListSelect(container), { target: { value: 'TCG' } });

      await waitFor(() => {
        expect(banListChipRow(container)).not.toBeNull();
      });

      const memberChip = Array.from(banListChipRow(container)!.querySelectorAll('button')).find(
        (chip) => chip.textContent === '2024.04 TCG'
      )!;
      fireEvent.click(memberChip);

      await waitFor(() => {
        expect(
          fetchMock.mock.calls.some(([url]) => String(url).includes('banListName=2024.04 TCG'))
        ).toBe(true);
      });

      expect(banListSelect(container).value).toBe('TCG');

      const row = banListChipRow(container)!;
      expect(row.getAttribute('aria-label')).toBe('Ban lists in TCG');
      expect(
        Array.from(row.querySelectorAll('button')).map((chip) => chip.getAttribute('aria-pressed'))
      ).toEqual(['false', 'true', 'false']);
    });

    it('goes back to the format ladder through its own chip', async () => {
      const fetchMock = mockFetch();

      const { container } = render(<Ranking />);

      await waitFor(() => {
        expect(banListSelect(container).querySelectorAll('option')).toHaveLength(3);
      });

      fireEvent.change(banListSelect(container), { target: { value: 'TCG' } });

      await waitFor(() => {
        expect(banListChipRow(container)).not.toBeNull();
      });

      const chips = Array.from(banListChipRow(container)!.querySelectorAll('button'));
      fireEvent.click(chips[1]);
      await waitFor(() => {
        expect(
          fetchMock.mock.calls.some(([url]) => String(url).includes('banListName=2024.04 TCG'))
        ).toBe(true);
      });

      fireEvent.click(Array.from(banListChipRow(container)!.querySelectorAll('button'))[0]);

      await waitFor(() => {
        expect(
          Array.from(banListChipRow(container)!.querySelectorAll('button'))[0].getAttribute('aria-pressed')
        ).toBe('true');
      });
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('banListName=TCG'))).toBe(true);
    });

    it('falls back to the flat ban list endpoint when the grouped request rejects', async () => {
      const fetchMock = mockFetch({ grouped: () => Promise.reject(new Error('network down')) });

      const { container } = render(<Ranking />);

      await waitFor(() => {
        expect(banListSelect(container).querySelectorAll('option')).toHaveLength(2);
      });

      const select = banListSelect(container);
      expect(Array.from(select.querySelectorAll('option')).map((option) => option.value)).toEqual([
        'Global',
        '2024.04 TCG',
      ]);
      expect(select.querySelector('optgroup')).toBeNull();
      expect(banListChipRow(container)).toBeNull();

      fireEvent.change(select, { target: { value: '2024.04 TCG' } });
      await waitFor(() => {
        expect(banListSelect(container).value).toBe('2024.04 TCG');
      });
      expect(banListChipRow(container)).toBeNull();
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/ban-lists?season='))).toBe(true);
    });

    it('falls back to the flat ban list endpoint when the grouped request is not ok', async () => {
      const fetchMock = mockFetch({
        grouped: async () => ({ ok: false, status: 500, json: async () => ({}) }),
      });

      const { container } = render(<Ranking />);

      await waitFor(() => {
        expect(banListSelect(container).querySelectorAll('option')).toHaveLength(2);
      });

      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/ban-lists?season='))).toBe(true);
    });

    it('falls back to the flat ban list endpoint when the grouped payload is flat', async () => {
      mockFetch({ grouped: async () => jsonResponse(['Global', '2024.04 TCG']) });

      const { container } = render(<Ranking />);

      await waitFor(() => {
        expect(banListSelect(container).querySelectorAll('option')).toHaveLength(2);
      });

      expect(banListSelect(container).querySelector('optgroup')).toBeNull();
    });
  });

  describe('Elo column', () => {
    it('renders the rating, the provisional badge and the empty placeholder', async () => {
      mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText, getByText } = render(<Ranking />);

      expect(await findByText('RatedDuelist')).toBeTruthy();

      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(3);

      const ratedRow = within(rows[0] as HTMLElement);
      expect(ratedRow.getByText('1544')).toBeTruthy();
      expect(ratedRow.queryByTitle('Provisional Elo — not enough duels yet')).toBeNull();

      const provisionalRow = within(rows[1] as HTMLElement);
      expect(provisionalRow.getByText('1210')).toBeTruthy();
      expect(provisionalRow.getByTitle('Provisional Elo — not enough duels yet')).toBeTruthy();

      const unratedRow = within(rows[2] as HTMLElement);
      expect(unratedRow.getByLabelText('No Elo on this ladder')).toBeTruthy();
      expect(unratedRow.getByText('—')).toBeTruthy();

      expect(getByText('Elo')).toBeTruthy();
    });
  });

  describe('sort control', () => {
    it('refetches the leaderboard with sortBy=rating', async () => {
      const fetchMock = mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container } = render(<Ranking />);

      await waitFor(() => {
        expect(fetchMock.mock.calls.some(([url]) => String(url).includes('sortBy=points'))).toBe(true);
      });

      const sortSelect = container.querySelector<HTMLSelectElement>('select[aria-label="Sort by"]')!;
      expect(Array.from(sortSelect.querySelectorAll('option')).map((option) => option.textContent)).toEqual([
        'Sort by Points',
        'Sort by Elo',
      ]);

      fireEvent.change(sortSelect, { target: { value: 'rating' } });

      await waitFor(() => {
        expect(fetchMock.mock.calls.some(([url]) => String(url).includes('sortBy=rating'))).toBe(true);
      });

      const ratingCall = fetchMock.mock.calls.find(([url]) => String(url).includes('sortBy=rating'))!;
      expect(String(ratingCall[0])).toBe(
        `${API_URL}/stats/?page=1&limit=20&banListName=Global&season=3&sortBy=rating`
      );
    });
  });
});
