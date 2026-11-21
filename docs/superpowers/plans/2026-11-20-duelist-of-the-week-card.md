# Duelist of the Week Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the player of the week as a holographic fourth card beside the ranking podium, and remove the old "Player of the Week" strip.

**Architecture:**
- `DuelistTradingCard` gains an optional `weekly` variant that switches the frame, the ribbon, the type line and the bottom line.
- A small parser in `src/utils/weeklyDuelist.ts` turns the API payload into a `Duelist` plus a week range.
- `Ranking.tsx` fetches the weekly player once and renders the card after a divider in the podium grid.

**Tech Stack:** React 19, Tailwind 4, Vitest with Testing Library, Astro container tests.

**Spec:** `docs/superpowers/specs/2026-11-20-duelist-of-the-week-card-design.md` (it extends `docs/superpowers/specs/2026-11-20-ranking-card-podium-design.md`).

## Global Constraints

- Ribbon text: `DUELIST OF THE WEEK`.
- Type line: `[<from> – <to>]`, with each date formatted `MMM d` in UTC (e.g. `[Nov 9 – Nov 15]`).
- Bottom line: `PTS/<points>`. Text box: `<wins> wins · <losses> losses · <formatWinRate(winRate, 1)> win rate`.
- Level comes from `cardLevel({ tier: null, winRate })`.
- Link: `/duelists/<userId>/Global?username=<username>&season=<PUBLIC_DEFAULT_SEASON>`.
- The endpoint is fetched once on mount, never on season or ban-list changes. If it fails or is empty, render neither the card nor the divider.
- Remove `DuelistOfTheWeek.astro` and its use in `index.astro`.
- The holo frame does not animate under reduced motion. Tilt and foil follow the existing card rules.
- Commits: subject line only, in conventional format.

## Review Focus

1. **Strings from the API:** `points`, `wins` and `losses` arrive as strings, and a non-numeric value must not render `NaN`. Pinned in Task 1 (`parses string counts and guards bad numbers`).
2. **A week with 0 wins and 0 losses** gives a null win rate, shown as `—`, and level 1. Pinned in Task 1.
3. **Date range near midnight:** formatting in local time could shift the day, so use UTC. Pinned in Task 1 (`formats the week range in UTC`).
4. **Tablet widths** (768–1023px): the fourth card must not overflow. Checked in Task 2's visual step.
5. **The weekly player is also in the podium:** both cards render, and they are not deduplicated. Pinned in Task 2 (`shows the weekly card even when that player is in the podium`).

---

### Task 1: Weekly payload parser and weekly card variant

**Files:**
- Create: `src/utils/weeklyDuelist.ts`
- Modify: `src/components/Cards/DuelistTradingCard.tsx`
- Test: `tests/utils/weeklyDuelist.test.ts`, `tests/components/Cards/DuelistTradingCard.test.tsx`

**Interfaces:**
- Produces:
  - `export type WeeklyDuelist = { duelist: Duelist; from: string; to: string }`
  - `export const parseWeeklyDuelist = (payload: unknown) => WeeklyDuelist | null`, which reads the first array item and returns null for an empty or invalid payload
  - `export const formatWeekRange = (from: string, to: string) => string`, which returns e.g. `'Nov 9 – Nov 15'`
- Produces: `DuelistTradingCard` accepts `weekly?: { from: string; to: string }`.
  - When it is set, `place` is ignored.
  - The root gets `data-weekly`.
  - The ribbon replaces the rank badge.
  - The type line is `[${formatWeekRange(from, to)}]`.
  - The bottom shows only `PTS/<points>`.
  - The frame is a holo conic gradient.

- [ ] **Step 1: Write the failing tests.**

```ts
// tests/utils/weeklyDuelist.test.ts
it('parses the first weekly item', () => {
  const parsed = parseWeeklyDuelist([{ userId: 'c13', username: 'Fuku', points: '27', wins: '19', losses: '5', from: '2026-11-09T00:00:00.000Z', to: '2026-11-15T00:00:00.000Z' }]);
  expect(parsed?.duelist).toMatchObject({ userId: 'c13', username: 'Fuku', points: 27, wins: 19, losses: 5 });
  expect(parsed?.duelist.winRate).toBeCloseTo(79.17, 1);
  expect(parsed?.from).toBe('2026-11-09T00:00:00.000Z');
});
it('returns null for an empty or invalid payload', () => { expect(parseWeeklyDuelist([])).toBeNull(); expect(parseWeeklyDuelist({})).toBeNull(); expect(parseWeeklyDuelist(null)).toBeNull(); });
it('parses string counts and guards bad numbers', () => { /* points: 'x' → points 0; wins '0', losses '0' → winRate null */ });
it('formats the week range in UTC', () => { expect(formatWeekRange('2026-11-09T00:00:00.000Z', '2026-11-15T00:00:00.000Z')).toBe('Nov 9 – Nov 15'); });
```

```tsx
// added to tests/components/Cards/DuelistTradingCard.test.tsx
it('renders the weekly variant', () => {
  render(<DuelistTradingCard {...fuku} tier={null} points={27} wins={19} losses={5} winRate={79.17} banListName="Global" season="7" place={1} showElo={false} weekly={{ from: '2026-11-09T00:00:00.000Z', to: '2026-11-15T00:00:00.000Z' }} />);
  const card = screen.getByRole('link');
  expect(card).toHaveAttribute('data-weekly');
  expect(card).toHaveAttribute('href', '/duelists/u1/Global?username=Fuku&season=7');
  expect(screen.getByText('DUELIST OF THE WEEK')).toBeInTheDocument();
  expect(screen.getByText('[Nov 9 – Nov 15]')).toBeInTheDocument();
  expect(screen.getByText('PTS/27')).toBeInTheDocument();
  expect(screen.queryByText(/WIN%\//)).toBeNull();
  expect(screen.queryByLabelText(/^Rank /)).toBeNull();
});
```

- [ ] **Step 2: Run and confirm they fail.** Run `bun run test -- tests/utils/weeklyDuelist.test.ts tests/components/Cards/DuelistTradingCard.test.tsx`. Expected: FAIL, because the module is missing and there is no weekly variant.
- [ ] **Step 3: Implement.**
  - `formatWeekRange` uses `toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })` on both dates.
  - The parser uses `Number()`, falling back to 0 when the value is not finite. The win rate is null when wins + losses is 0, and `position` is 0.
  - In the card, branch on `weekly` for the frame class, the ribbon, the type line and the bottom line. Everything else (tilt, foil, art, name, text box) is shared.
- [ ] **Step 4: Run and confirm they pass.** Run the same command as Step 2. Expected: PASS.
- [ ] **Step 5: Commit** with `feat(ranking): add the weekly duelist card variant`.

### Task 2: Weekly card beside the podium; remove the old strip

**Files:**
- Modify: `src/sections/Ranking.tsx`, `src/pages/index.astro`
- Delete: `src/components/Cards/DuelistOfTheWeek.astro`
- Test: `tests/sections/Ranking.test.tsx`, `tests/pages/IndexPage.test.ts`

**Interfaces:**
- Consumes: `parseWeeklyDuelist` and `WeeklyDuelist` from Task 1, and `DuelistTradingCard` with `weekly`.

- [ ] **Step 1: Write the failing tests.**
  - In `Ranking.test.tsx`, extend `mockFetch` with a `weekly` option (default: one Fuku-like item) that answers URLs containing `/stats/player-of-the-week`. The existing `/stats` branch must not catch this URL, so check `player-of-the-week` first.

```ts
it('shows the weekly card after the podium', async () => { /* render → findByText('DUELIST OF THE WEEK'); container.querySelector('[data-weekly]') is after the [data-place="3"] card in DOM order */ });
it('hides the weekly card when the endpoint fails or is empty', async () => { /* weekly: () => Promise.reject(...) → no [data-weekly]; weekly: [] → no [data-weekly] */ });
it('fetches the weekly player once, not on filter changes', async () => { /* change ban list to 'Goat Format' and season → calls to player-of-the-week === 1 */ });
it('shows the weekly card even when that player is in the podium', async () => { /* weekly userId equals cardDuelists[0].userId → both [data-place="1"] and [data-weekly] exist */ });
```

  - In `IndexPage.test.ts`, remove the `DuelistOfTheWeek` mock and add `it('no longer renders the separate player of the week strip')`, which checks that the output does not contain `Player of the Week`.
- [ ] **Step 2: Run and confirm they fail.** Run `bun run test -- tests/sections/Ranking.test.tsx tests/pages/IndexPage.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - In `Ranking.tsx`, add `const [weekly, setWeekly] = useState<WeeklyDuelist | null>(null)` and a mount-only `useEffect` that fetches `${API_URL}/stats/player-of-the-week`. On error, log and keep null.
  - Render a divider (`<li aria-hidden className="hidden md:block w-px self-stretch bg-gradient-to-b from-transparent via-base-content/20 to-transparent">`) and a `<li>` holding `DuelistTradingCard` with `weekly={{ from, to }}`, `banListName="Global"`, `season={import.meta.env.PUBLIC_DEFAULT_SEASON}` and `showElo={false}`.
  - Grid: `md:grid-cols-[1fr_1.15fr_1fr_auto_1fr]`, with the weekly slot `md:order-5` and the divider `md:order-4`. On mobile, the weekly slot is `col-span-2 mx-auto w-[48%]`, below #2 and #3.
  - Widen the podium `max-w` (e.g. `max-w-6xl`) so four cards fit.
  - Delete `DuelistOfTheWeek.astro` and its import and use in `index.astro`.
- [ ] **Step 4: Run and confirm they pass.** Run the same command as Step 2. Expected: PASS.
- [ ] **Step 5: Full verification and visual check.**
  - Run `bun run test && bun run build`. Expected: all tests pass and 0 errors.
  - With Playwright on the dev server, check `#section-ranking` at 1366×768, 1024×768, 768×1024 and 390×844: the order is #2, #1, #3, divider, weekly; there is no horizontal overflow beyond the existing 1024px navbar one; the mobile weekly card sits below #2 and #3. Review the screenshots.
- [ ] **Step 6: Commit** with `feat(ranking): bring the duelist of the week into the podium`.
