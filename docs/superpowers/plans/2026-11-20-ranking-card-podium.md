# Ranking Card Podium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ranking's four plain top cards with a podium of three YGO-style cards (our own frame), and hide Elo where the API has none (Global).

**Architecture:**
- A pure helper (`src/utils/tier.ts`) maps a duelist to a card level.
- A new React component (`DuelistTradingCard.tsx`) renders one card, with a small pointer-tilt hook and a CSS foil.
- `Ranking.tsx` lays out the podium (DOM order 1, 2, 3; grid order 2, 1, 3 on desktop), starts the table at #4, and hides Elo in Global.
- The old `DuelistCard` is deleted, since Ranking was its only user.

**Tech Stack:** React 19, Tailwind 4 and DaisyUI 5, Vitest with Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-20-ranking-card-podium-design.md`

## Global Constraints

- Our own frame, drawn with CSS. No Konami templates, frame artwork or fonts.
- **Level:** on ladders it is tier `order + 1` (rookie 1, bronze 2, silver 3, gold 4, platinum 5, diamond 6, master 7). In Global it comes from `winRateStars()`, floored to 1–5.
- **Type line:** `[Duelist / <Tier name>]` on ladders, `[Duelist]` in Global.
- **Bottom line:** `PTS/<points>` and `ELO/<rating>` on ladders (a null rating shows `ELO/—`, a provisional one keeps the `?` marker with title `Provisional Elo — not enough duels yet`). In Global it is `PTS/<points>` and `WIN%/<formatWinRate(winRate, 0)>`.
- **Text box:** `<wins> wins · <losses> losses · <formatWinRate(winRate, 1)> win rate`.
- **Frame by place:** 1 gold, 2 silver, 3 bronze. #1 is `featured`: bigger, with an animated foil.
- **Reduced motion:** `prefers-reduced-motion: reduce` turns off the tilt and the animated foil.
- **Link:** `/duelists/${userId}/${banListName}?username=${username}&season=${season}`, the same as today's card.
- **Global:** there is no Elo column and no "Sort by Elo" option. Switching to Global with `sortBy=rating` resets the sort to `points`.
- **Mobile:** #1 on top at about 58% of the width, with #2 and #3 side by side below. On desktop, #2 sits left, #1 in the center (raised) and #3 on the right.
- **Commits:** subject line only, in conventional format.

## Review Focus

1. **Tilt left stuck:** after the pointer leaves, the card must return flat. Pinned in Task 2 (`resets the tilt when the pointer leaves`).
2. **Touch:** touch pointers must not tilt the card, so scrolling over the podium doesn't jiggle it. Pinned in Task 2 (`ignores touch pointers`).
3. **Long names**, including the `(You)` suffix, must truncate, with the full name in `title`. Pinned in Task 2.
4. **A ban list with fewer than 3 players** renders only the existing cards, and there is no empty table. Pinned in Task 3.
5. **A null win rate in Global** shows `WIN%/—` and level 1 instead of crashing. Pinned in Tasks 1 and 2.

---

### Task 1: Card level helper and tier type

**Files:**
- Create: `src/utils/tier.ts`
- Modify: `src/types/Duelist.d.ts`, adding `tier?: DuelistTier | null`
- Test: `tests/utils/tier.test.ts`

**Interfaces:**
- Produces:
  - `export type TierId = 'rookie' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master'`
  - `export type DuelistTier = { id: TierId; name: string }`, exported from `Duelist.d.ts` and re-exported in `types.d.ts`
  - `export const cardLevel = (duelist: { tier?: DuelistTier | null; winRate: number | null }) => number`

- [ ] **Step 1: Write the failing test**

```ts
import { cardLevel } from '@utils/tier';
it('uses the tier order on ladders', () => {
  expect(cardLevel({ tier: { id: 'rookie', name: 'Rookie' }, winRate: 10 })).toBe(1);
  expect(cardLevel({ tier: { id: 'diamond', name: 'Diamond' }, winRate: 10 })).toBe(6);
  expect(cardLevel({ tier: { id: 'master', name: 'Master' }, winRate: 10 })).toBe(7);
});
it('falls back to win-rate stars in Global', () => {
  expect(cardLevel({ tier: null, winRate: 71.3 })).toBe(3);
  expect(cardLevel({ tier: null, winRate: 100 })).toBe(5);
  expect(cardLevel({ winRate: null })).toBe(1);
});
```

- [ ] **Step 2: Run and confirm it fails.** Run `bun run test -- tests/utils/tier.test.ts`. Expected: FAIL, because `@utils/tier` does not resolve.
- [ ] **Step 3: Implement `cardLevel`.** Use a `Record<TierId, number>` of order+1 values; otherwise `Math.floor(winRateStars(winRate))` from `@utils/winRate`.
- [ ] **Step 4: Run and confirm it passes.** Run `bun run test -- tests/utils/tier.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit** with `feat(ranking): add the card level helper`.

### Task 2: DuelistTradingCard

**Files:**
- Create: `src/components/Cards/DuelistTradingCard.tsx`
- Test: `tests/components/Cards/DuelistTradingCard.test.tsx`

**Interfaces:**
- Consumes: `cardLevel` and `DuelistTier` from Task 1, plus `formatWinRate` from `@utils/winRate`.
- Produces: `export default function DuelistTradingCard(props: Readonly<Duelist & { banListName: string; season: string; place: 1 | 2 | 3; featured?: boolean; showElo: boolean }>)`.
- Rendered output:
  - the root `<a>` carries the profile href and `data-place={place}`, plus `data-tilt="on" | "off"`;
  - the level stars sit in an element with `aria-label="Level N"`;
  - the foil element has `data-foil`, and when animated it also has `data-foil-animated`.

- [ ] **Step 1: Write the failing tests.**
  - Use a fixture duelist: Fuku, 212 points, 210 wins, 85 losses, winRate 71.19, rating 1154, tier `{ id: 'master', name: 'Master' }`.

```ts
it('renders a ladder card', () => {
  render(<DuelistTradingCard {...fuku} banListName="TCG" season="7" place={1} featured showElo />);
  const card = screen.getByRole('link');
  expect(card).toHaveAttribute('href', '/duelists/u1/TCG?username=Fuku&season=7');
  expect(card).toHaveAttribute('data-place', '1');
  expect(screen.getByLabelText('Level 7')).toBeInTheDocument();
  expect(screen.getByText('[Duelist / Master]')).toBeInTheDocument();
  expect(screen.getByText('210 wins · 85 losses · 71.2% win rate')).toBeInTheDocument();
  expect(screen.getByText('PTS/212')).toBeInTheDocument();
  expect(screen.getByText('ELO/1154')).toBeInTheDocument();
});
it('marks a provisional Elo and shows a dash when there is none', () => { /* provisional: true → getByTitle('Provisional Elo — not enough duels yet'); rating: null → 'ELO/—' */ });
it('renders a Global card with win rate instead of Elo', () => {
  render(<DuelistTradingCard {...fuku} tier={null} winRate={71.3} banListName="Global" season="7" place={2} showElo={false} />);
  expect(screen.getByText('[Duelist]')).toBeInTheDocument();
  expect(screen.getByLabelText('Level 3')).toBeInTheDocument();
  expect(screen.getByText('WIN%/71%')).toBeInTheDocument();
  expect(screen.queryByText(/ELO\//)).toBeNull();
});
it('shows WIN%/— and level 1 for a null win rate', () => { /* tier null, winRate null, showElo false */ });
it('truncates a long name and keeps it in the title', () => { /* username 'AVeryLongDuelistName (You)' → getByTitle('AVeryLongDuelistName (You)') */ });
it('animates the foil only on the featured card', () => { /* featured → container.querySelector('[data-foil-animated]') not null; place 2 without featured → null */ });
it('turns tilt and foil animation off for reduced motion', () => { /* stub matchMedia matches:true → data-tilt="off", no [data-foil-animated] */ });
it('tilts with a mouse pointer and resets when the pointer leaves', () => {
  // fireEvent.pointerMove(card, { pointerType: 'mouse', clientX, clientY }) → card.style.getPropertyValue('--tilt-x') !== ''
  // fireEvent.pointerLeave(card) → --tilt-x and --tilt-y are '0deg'
});
it('ignores touch pointers', () => { /* pointerMove with pointerType 'touch' → --tilt-x stays '' or '0deg' */ });
```

  - jsdom gives `getBoundingClientRect` zeros. Stub it on the card in the tilt tests, for example `{ left: 0, top: 0, width: 200, height: 300 }`.

- [ ] **Step 2: Run and confirm they fail.** Run `bun run test -- tests/components/Cards/DuelistTradingCard.test.tsx`. Expected: FAIL, because the module is missing.
- [ ] **Step 3: Implement the component.**
  - The reduced-motion check follows the `usePrefersReducedMotion` pattern in `src/sections/News.tsx`. Extract it to `src/utils/usePrefersReducedMotion.ts` and import it in both places.
  - The tilt sets `--tilt-x` and `--tilt-y` (±8deg) from the pointer position, but only for `pointerType === 'mouse'`, and resets them to `0deg` on pointer leave.
  - Use a CSS `transform: perspective(800px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))` inline. The foil is an absolutely positioned gradient layer; its animated variant uses a keyframe in a component-scoped `<style>` or a Tailwind `animate-[...]` class.
  - Frame colours: gold `#a16207→#fde68a`, silver `#64748b→#e2e8f0`, bronze `#9a3412→#fdba74`. The text box is a parchment colour, as in the approved mockup.
  - The featured card is larger, for example `md:w-60` against `md:w-48`.
- [ ] **Step 4: Run and confirm they pass.** Run `bun run test -- tests/components/Cards/DuelistTradingCard.test.tsx tests/sections/News.test.tsx`. Expected: PASS. News is still green after the hook extraction.
- [ ] **Step 5: Commit** with `feat(ranking): add the YGO-style duelist card`.

### Task 3: Podium, table from #4, Elo hidden in Global

**Files:**
- Modify: `src/sections/Ranking.tsx`
- Delete: `src/components/Cards/DuelistCard.tsx`, `tests/components/Cards/DuelistCard.test.tsx`
- Test: `tests/sections/Ranking.test.tsx`

**Interfaces:**
- Consumes: `DuelistTradingCard` from Task 2.

- [ ] **Step 1: Write the failing tests and update the old ones** in `tests/sections/Ranking.test.tsx`.
  - Replace the `top four cards` describe with `podium`:

```ts
it('renders the top three as cards in ranking order, featuring #1', async () => {
  mockFetch({ stats: [...cardDuelists, ...tableDuelists] });
  const { container, findByText } = render(<Ranking />);
  expect(await findByText('RatedCardDuelist')).toBeTruthy();
  const cards = container.querySelectorAll('[data-place]');
  expect([...cards].map((c) => c.getAttribute('data-place'))).toEqual(['1', '2', '3']);
  expect(container.querySelector('[data-place="1"] [data-foil-animated]')).not.toBeNull();
});
it('starts the table at position 4', async () => { /* first tbody row's first cell text is the 4th duelist's position; PlainCardDuelist (4th) appears in the table, not as a card */ });
it('renders only the cards that exist when a ban list has fewer than three players', async () => { /* stats: two duelists → 2 [data-place] elements, no tbody rows */ });
```

  - The default ban list in the tests is Global, so move the existing Elo-column and sort-control tests to a ladder first: `fireEvent.change(banListSelect(container), { target: { value: 'Goat Format' } })`. Keep their assertions, and adjust row counts now that the table starts at #4.
  - Add:

```ts
it('hides the Elo column and the Elo sort in Global', async () => {
  mockFetch({ stats: [...cardDuelists, ...tableDuelists] });
  const { container, findByText } = render(<Ranking />);
  await findByText('RatedDuelist');
  expect([...container.querySelectorAll('thead th')].map((th) => th.textContent)).not.toContain('Elo');
  expect([...container.querySelectorAll('select[aria-label="Sort by"] option')].map((o) => o.textContent)).toEqual(['Sort by Points']);
});
it('resets an Elo sort to points when switching to Global', async () => {
  // switch to 'Goat Format', choose sortBy=rating, switch back to 'Global'
  // → the last stats fetch URL contains 'banListName=Global' and 'sortBy=points'
});
```

- [ ] **Step 2: Run and confirm they fail.** Run `bun run test -- tests/sections/Ranking.test.tsx`. Expected: FAIL on the podium, table-from-4 and Global tests.
- [ ] **Step 3: Implement in `Ranking.tsx`.**
  - Use `data.slice(0, 3)` and `data.slice(3)`.
  - Set `const isGlobal = banList === 'Global'`.
  - In the podium `<ul>`, render `DuelistTradingCard` with `place={index + 1}`, `featured={index === 0}`, `showElo={!isGlobal}` and the display name. The grid is `grid-cols-2` on mobile with #1 spanning `col-span-2` (centered, about 58% width). On `md` it is three columns with `md:order-2` for #1, `md:order-1` for #2 and `md:order-3` for #3, and #1 raised with a negative margin or `md:-translate-y`.
  - Render the Elo `<th>`/`<td>` and the `rating` option only when `!isGlobal`.
  - In the ban-list change handler and in `setBanList` from the chips, reset `sortBy` to `'points'` when the new list is Global.
  - Delete `DuelistCard.tsx` and its test. Remove the now-unused `getBorderColor` and `BorderColor` if nothing else uses them.
- [ ] **Step 4: Run and confirm they pass.** Run `bun run test -- tests/sections/Ranking.test.tsx`. Expected: PASS.
- [ ] **Step 5: Commit** with `feat(ranking): show the top three as a podium of duelist cards`.

### Task 4: Visual check and full verification

- [ ] **Step 1: Full verification.** Run `bun run lint && bun run test && bun run build`. Expected: no new lint errors in `src/`, all tests pass, and `astro check` shows 0 errors.
- [ ] **Step 2: Browser check** on the dev server, with Playwright on `/?edition=off` scrolled to `#section-ranking`.
  - At 1366×768, the podium order is #2, #1, #3 left to right, #1 is visibly larger and raised, and there is no horizontal overflow.
  - At 390×844, #1 is on top and #2 and #3 are side by side.
  - With `reducedMotion: 'reduce'`, the cards have `data-tilt="off"`.
  - Screenshots are reviewed. Adjust spacing if needed and repeat.
- [ ] **Step 3: Commit adjustments, if any,** with `style(ranking): tune the podium spacing`.
