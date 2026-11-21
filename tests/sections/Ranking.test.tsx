import { render, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Duelist } from '@types';
import Ranking from '@sections/Ranking';
import { parseWeeklyDuelist } from '@utils/weeklyDuelist';

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
const cardDuelists = [
  buildDuelist({ userId: '1', username: 'RatedCardDuelist', rating: 1720.4, provisional: false }),
  buildDuelist({ userId: '2', username: 'NewCardDuelist', rating: 1105.6, provisional: true }),
  buildDuelist({ userId: '3', username: 'UnratedCardDuelist', rating: null }),
  buildDuelist({ userId: '4', username: 'PlainCardDuelist' }),
];

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

const weeklyItem = {
  userId: 'w1',
  username: 'WeeklyDuelist',
  points: '27',
  wins: '19',
  losses: '5',
  from: '2026-11-09T00:00:00.000Z',
  to: '2026-11-15T00:00:00.000Z',
};

type FetchOverrides = {
  grouped?: () => Promise<unknown>;
  flat?: unknown;
  stats?: Duelist[];
  weekly?: unknown[] | (() => Promise<unknown>);
};

const mockFetch = ({ grouped, flat = flatBanLists, stats = [], weekly = [weeklyItem] }: FetchOverrides = {}) => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/stats/player-of-the-week')) {
      return typeof weekly === 'function' ? await weekly() : jsonResponse(weekly);
    }
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

const sortButtons = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLButtonElement>('[role="group"][aria-label="Sort by"] button')];

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

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('RatedDuelist')).toBeTruthy();
      fireEvent.change(banListSelect(container), { target: { value: 'Goat Format' } });
      await waitFor(() => expect(container.querySelector('thead')?.textContent).toContain('Elo'));

      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(4);

      const ratedRow = within(rows[1] as HTMLElement);
      expect(ratedRow.getByText('1544')).toBeTruthy();
      expect(ratedRow.queryByTitle('Provisional Elo — not enough duels yet')).toBeNull();

      const provisionalRow = within(rows[2] as HTMLElement);
      expect(provisionalRow.getByText('1210')).toBeTruthy();
      expect(provisionalRow.getByTitle('Provisional Elo — not enough duels yet')).toBeTruthy();

      const unratedRow = within(rows[3] as HTMLElement);
      expect(unratedRow.getByLabelText('No Elo on this ladder')).toBeTruthy();
      expect(unratedRow.getByText('—')).toBeTruthy();
    });
  });

  describe('win rate column', () => {
    it('renders a dash for duelists the API sends with a null win rate', async () => {
      const noDecisions = buildDuelist({ userId: '8', username: 'NoDecisionsDuelist', position: 5, wins: 0, losses: 0, winRate: null, rating: 1500 });
      mockFetch({ stats: [...cardDuelists, noDecisions] });

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('NoDecisionsDuelist')).toBeTruthy();

      const cells = container.querySelectorAll('tbody tr td');
      expect(cells[cells.length - 1].textContent).toBe('—');
    });
  });

  describe('podium', () => {
    it('renders the top three as cards in ranking order, featuring #1', async () => {
      mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('RatedCardDuelist')).toBeTruthy();
      const cards = container.querySelectorAll('[data-place]');
      expect([...cards].map((card) => card.getAttribute('data-place'))).toEqual(['1', '2', '3']);
      expect(container.querySelector('[data-place="1"] [data-foil-animated]')).not.toBeNull();
      expect(container.querySelector('[data-place="2"] [data-foil-animated]')).toBeNull();
    });

    it('shows Elo on ladder cards and win rate on Global cards', async () => {
      mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('RatedCardDuelist')).toBeTruthy();
      expect(within(container.querySelector('[data-place="1"]') as HTMLElement).getByText('WIN%/67%')).toBeTruthy();

      fireEvent.change(banListSelect(container), { target: { value: 'Goat Format' } });
      await waitFor(() => {
        const first = container.querySelector('[data-place="1"]') as HTMLElement;
        expect(within(first).getByText('ELO/1720')).toBeTruthy();
      });
      const second = container.querySelector('[data-place="2"]') as HTMLElement;
      expect(within(second).getByTitle('Provisional Elo — not enough duels yet')).toBeTruthy();
    });

    it('starts the table at position 4', async () => {
      mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('RatedDuelist')).toBeTruthy();
      const firstRow = container.querySelector('tbody tr') as HTMLElement;
      expect(within(firstRow).getByText('PlainCardDuelist')).toBeTruthy();
      expect(container.querySelector('[data-place="4"]')).toBeNull();
    });

    it('renders only the cards that exist when a ban list has fewer than three players', async () => {
      mockFetch({ stats: cardDuelists.slice(0, 2) });

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('NewCardDuelist')).toBeTruthy();
      expect(container.querySelectorAll('[data-place]')).toHaveLength(2);
      expect(container.querySelector('table')).toBeNull();
    });

    it('places each card in its own podium column so a lone #1 stays centered', async () => {
      mockFetch({ stats: cardDuelists.slice(0, 1) });

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('RatedCardDuelist')).toBeTruthy();
      expect(container.querySelector('[data-place="1"]')!.closest('li')).toHaveClass('md:col-start-2', 'md:row-start-1');
    });

    it('puts #2 on the left and #3 on the right column', async () => {
      mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('RatedCardDuelist')).toBeTruthy();
      expect(container.querySelector('[data-place="2"]')!.closest('li')).toHaveClass('md:col-start-1');
      expect(container.querySelector('[data-place="3"]')!.closest('li')).toHaveClass('md:col-start-3');
    });
  });

  describe('filters', () => {
    it('names the season and format being viewed under the title, without the long description', async () => {
      mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText, getByRole, getByText, queryByText } = render(<Ranking />);

      expect(await findByText('RatedCardDuelist')).toBeTruthy();
      expect(getByRole('heading', { level: 2, name: 'Top Players' })).toBeTruthy();
      expect(getByText('Season 3 · Global')).toBeTruthy();
      expect(queryByText(/Explore the top players/)).toBeNull();

      fireEvent.change(banListSelect(container), { target: { value: 'TCG' } });
      await waitFor(() => expect(getByText('Season 3 · TCG')).toBeTruthy());
      fireEvent.click(getByRole('button', { name: '2024.04 TCG' }));
      await waitFor(() => expect(getByText('Season 3 · 2024.04 TCG')).toBeTruthy());
    });

    it('shows season and format as compact pills that wrap in one row', async () => {
      mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('RatedCardDuelist')).toBeTruthy();
      const selects = container.querySelectorAll('#section-ranking select');
      expect(selects).toHaveLength(2);
      selects.forEach((select) => {
        expect(select).toHaveClass('rounded-full');
        expect(select).not.toHaveClass('w-full');
      });
      expect(selects[0].parentElement).toHaveClass('flex-wrap');
      expect(selects[0].parentElement).not.toHaveClass('flex-col');
      // The podium vortex is positioned and reaches up under the filters; they must stack above it.
      expect(selects[0].parentElement).toHaveClass('relative', 'z-10');
    });

    it('gives the select dropdowns an opaque background over the translucent pill', async () => {
      mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('RatedCardDuelist')).toBeTruthy();
      // DaisyUI's customizable picker inherits the select's background, which is bg-white/10 here.
      container.querySelectorAll('#section-ranking select').forEach((select) => {
        expect(select).toHaveClass('[&::picker(select)]:bg-base-300');
      });
    });
  });

  describe('vortex', () => {
    it('draws the vortex behind the podium', async () => {
      mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('RatedCardDuelist')).toBeTruthy();
      // Centered on the #1 card, behind it, wherever the row puts that card.
      const firstSlot = container.querySelector('[data-place="1"]')!.closest('li')!;
      const vortex = firstSlot.querySelector('[data-podium-vortex]')!;
      expect(vortex).not.toBeNull();
      expect(vortex.compareDocumentPosition(firstSlot.querySelector('[data-place="1"]')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(container.querySelectorAll('[data-podium-vortex]')).toHaveLength(1);
    });

    it('draws no vortex when the podium is empty', async () => {
      mockFetch({ stats: [] });

      const { container } = render(<Ranking />);

      await waitFor(() => expect(container.querySelector('[aria-label="Top three duelists"]')).not.toBeNull());
      expect(container.querySelector('[data-podium-vortex]')).toBeNull();
    });
  });

  describe('duelist of the week', () => {
    const weekly = parseWeeklyDuelist([weeklyItem])!;

    it('shows the weekly card after the podium, from its prop, without fetching it', async () => {
      const fetchMock = mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText } = render(<Ranking weekly={weekly} />);

      expect(await findByText('DUELIST OF THE WEEK')).toBeTruthy();
      const third = container.querySelector('[data-place="3"]')!;
      const weeklyCard = container.querySelector('[data-weekly]')!;
      expect(third.compareDocumentPosition(weeklyCard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(within(weeklyCard as HTMLElement).getByText('[Nov 9 – Nov 15]')).toBeTruthy();
      expect(weeklyCard.closest('li')).toHaveClass('lg:col-start-5');
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('player-of-the-week'))).toBe(false);
    });

    it('renders no weekly card without the prop', async () => {
      mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('RatedCardDuelist')).toBeTruthy();
      expect(container.querySelector('[data-weekly]')).toBeNull();
      expect(container.querySelector('[data-podium-divider]')).toBeNull();
    });

    it('waits for the leaderboard before showing the cards, so nothing shifts when it lands', async () => {
      const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('/ban-lists/grouped')) return jsonResponse(groupedBanLists);
        if (url.includes('/ban-lists')) return jsonResponse(flatBanLists);
        return new Promise(() => {});
      });
      vi.stubGlobal('fetch', fetchMock);

      const { container } = render(<Ranking weekly={weekly} />);

      await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/stats/'))).toBe(true));
      expect(container.querySelector('[data-weekly]')).toBeNull();
    });

    it('centers the weekly card when the podium is empty', async () => {
      mockFetch({ stats: [] });

      const { container, findByText } = render(<Ranking weekly={weekly} />);

      expect(await findByText('DUELIST OF THE WEEK')).toBeTruthy();
      expect(container.querySelector('[data-weekly]')!.closest('li')).not.toHaveClass('lg:col-start-5');
      expect(container.querySelector('[data-podium-divider]')).toBeNull();
    });

    it('keeps the podium width fixed per breakpoint whether or not there is a weekly card', async () => {
      mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText } = render(<Ranking weekly={weekly} />);

      expect(await findByText('DUELIST OF THE WEEK')).toBeTruthy();
      expect(container.querySelector('[aria-label="Top three duelists"]')).toHaveClass('max-w-4xl', 'lg:max-w-6xl');
    });

    it('shows the weekly card even when that player is in the podium', async () => {
      mockFetch({ stats: [...cardDuelists, ...tableDuelists] });
      const samePlayer = parseWeeklyDuelist([{ ...weeklyItem, userId: '1', username: 'RatedCardDuelist' }])!;

      const { container, findByText } = render(<Ranking weekly={samePlayer} />);

      expect(await findByText('DUELIST OF THE WEEK')).toBeTruthy();
      expect(container.querySelector('[data-place="1"]')).not.toBeNull();
      expect(container.querySelector('[data-weekly]')).not.toBeNull();
    });
  });

  describe('Global ladder', () => {
    it('hides the Elo column and the Elo sort in Global', async () => {
      mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('RatedDuelist')).toBeTruthy();
      expect([...container.querySelectorAll('thead th')].map((th) => th.textContent)).not.toContain('Elo');
      // Elo stays visible but disabled in Global, which has no Elo ladder.
      expect(sortButtons(container).map((button) => button.textContent)).toEqual(['Points', 'Elo']);
      expect(sortButtons(container)[0]).toHaveAttribute('aria-pressed', 'true');
      expect(sortButtons(container)[1]).toBeDisabled();
      expect(sortButtons(container)[1]).toHaveAttribute('aria-pressed', 'false');
    });

    it('resets an Elo sort to points when switching to Global', async () => {
      const fetchMock = mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container, findByText } = render(<Ranking />);

      expect(await findByText('RatedDuelist')).toBeTruthy();
      fireEvent.change(banListSelect(container), { target: { value: 'Goat Format' } });
      await waitFor(() => expect(sortButtons(container)[1]).toBeEnabled());
      fireEvent.click(sortButtons(container)[1]);
      await waitFor(() => {
        expect(fetchMock.mock.calls.some(([url]) => String(url).includes('sortBy=rating'))).toBe(true);
      });

      fireEvent.change(banListSelect(container), { target: { value: 'Global' } });

      await waitFor(() => {
        const statsCalls = fetchMock.mock.calls.map(([url]) => String(url)).filter((url) => url.includes('/stats/'));
        const last = statsCalls.at(-1)!;
        expect(last).toContain('banListName=Global');
        expect(last).toContain('sortBy=points');
      });
      expect(sortButtons(container)[0]).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('sort control', () => {
    it('refetches the leaderboard with sortBy=rating', async () => {
      const fetchMock = mockFetch({ stats: [...cardDuelists, ...tableDuelists] });

      const { container } = render(<Ranking />);

      await waitFor(() => {
        expect(fetchMock.mock.calls.some(([url]) => String(url).includes('sortBy=points'))).toBe(true);
      });

      fireEvent.change(banListSelect(container), { target: { value: 'Goat Format' } });
      await waitFor(() => expect(sortButtons(container)[1]).toBeEnabled());
      expect(sortButtons(container).map((button) => button.textContent)).toEqual(['Points', 'Elo']);

      fireEvent.click(sortButtons(container)[1]);
      await waitFor(() => expect(sortButtons(container)[1]).toHaveAttribute('aria-pressed', 'true'));

      await waitFor(() => {
        expect(fetchMock.mock.calls.some(([url]) => String(url).includes('sortBy=rating'))).toBe(true);
      });

      const ratingCall = fetchMock.mock.calls.find(([url]) => String(url).includes('sortBy=rating'))!;
      expect(String(ratingCall[0])).toBe(
        `${API_URL}/stats/?page=1&limit=20&banListName=Goat Format&season=3&sortBy=rating`
      );
    });
  });
});
