# EvoDuel Home Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Outside seasonal editions, the home opens with an EvoDuel block plus a compact news card in one row, with the live duels marquee still in the first screen.

**Architecture:**
- A static Astro component (`EvoDuelHero.astro`) renders the EvoDuel pitch, so its text ships in the HTML.
- `News.tsx` gains a `variant="compact"` card that reuses the same news items.
- Only the no-edition branch of `src/pages/index.astro` changes. A CSS grid places hero, Live and News as "hero | news / live" on desktop and "hero / live / news" on mobile. The DOM order is hero → Live → News, so the existing "live before news" test still holds.

**Tech Stack:** Astro 5, React 19 (Swiper), Svelte 5, Tailwind 4 and DaisyUI 5, Vitest with the Astro container API.

**Spec:** `docs/superpowers/specs/2026-11-20-evoduel-home-hero-design.md`

## Global Constraints

- The copy is English and exact. Use these strings:
  - eyebrow: `Evolution YGO · Season {season}`;
  - `h1`: `EvoDuel`;
  - subtitle: `YGO duels in your browser. Against players or the AI, on phone or desktop.`;
  - highlights: `Duel the AI`, `Phone & desktop`, `No install`, `Daily missions`, `Essence & shop`, `Cosmetics & emotes`;
  - account line: `Play without an account. Sign in to earn rewards.`
- The headline must not be "Play Yu-Gi-Oh!".
- `Play now` links to `https://evoduel.com` with `data-umami-event="home-click-evoduel-play"`.
- `Other clients` links to `#section-download` with `data-umami-event="home-click-other-clients"`.
- The seasonal edition branch (`EditionHero` present) renders exactly as today: edition hero, then Live, then the full News carousel.
- At 1366×768 and 390×844, with no edition, the live marquee must start above the fold.
- Commits use the subject line only, in conventional format.

## Review Focus

1. **Before hydration**, News and Live are `client:only` and render nothing. The row must reserve the news card's height on desktop so the marquee doesn't jump when React mounts. Pinned in Task 1 (`min-h-` class on the news grid cell).
2. **Slides of different lengths:** the compact card must keep one height as autoplay rotates, so the marquee below doesn't bounce. Pinned in Task 2 (description is `line-clamp-3`, image has a fixed aspect).
3. **`prefers-reduced-motion`** must turn off autoplay and transitions in the compact card, as it does in the full carousel. Pinned in Task 2.
4. **Two carousels on one page:** the compact card's arrows must not use the full carousel's `.news-swiper-prev/next` selectors. Pinned in Task 2.
5. **Tablet widths (768–1023 px)** stack like mobile, and the row starts at `lg`. Checked in Task 3's viewport measurement.

---

### Task 1: EvoDuel block and home wiring

**Files:**
- Create: `src/utils/evoDuel.ts`
- Create: `src/components/EvoDuel/EvoDuelHero.astro`
- Modify: `src/pages/index.astro`, the no-edition branch plus `description` and `keywords`
- Modify: `src/sections/Download.astro:7`, which imports the version instead of declaring it
- Test: `tests/pages/IndexPage.test.ts`

**Interfaces:**
- Produces: `src/utils/evoDuel.ts`, exporting `EVODUEL_URL = 'https://evoduel.com'` and `EVODUEL_VERSION = '1.2.0'`.
- Produces: `EvoDuelHero.astro` with props `{ season: string }`.
- Consumes: `<News variant="compact" client:only='react' />` from Task 2. The page test mocks News, so Task 1 does not depend on Task 2 being done.

- [ ] **Step 1: Write the failing tests** in `tests/pages/IndexPage.test.ts`
  - Replace the `expect(result).toContain('Evolution YGO Season')` line in "renders the home sections" with the new copy.
  - Add these cases:

```ts
it('opens with the EvoDuel block outside editions', async () => {
  const result = await renderIndex('http://localhost/?edition=off');
  expect(result).toMatch(/<h1[^>]*>\s*EvoDuel\s*<\/h1>/);
  expect(result).toContain('Evolution YGO · Season 2024');
  expect(result).toContain('YGO duels in your browser. Against players or the AI, on phone or desktop.');
  for (const highlight of ['Duel the AI', 'Phone &amp; desktop', 'No install', 'Daily missions', 'Essence &amp; shop', 'Cosmetics &amp; emotes']) {
    expect(result).toContain(highlight);
  }
  expect(result).toContain('Play without an account. Sign in to earn rewards.');
  expect(result).toMatch(/<a[^>]*href="https:\/\/evoduel.com"[^>]*data-umami-event="home-click-evoduel-play"/);
  expect(result).toMatch(/<a[^>]*href="#section-download"[^>]*data-umami-event="home-click-other-clients"/);
  expect(result).not.toContain('Play Yu-Gi-Oh!');
});

it('reserves the news card height so the marquee does not jump on hydration', async () => {
  const result = await renderIndex('http://localhost/?edition=off');
  expect(result).toMatch(/data-home-news[^>]*class="[^"]*lg:min-h-/);
});

it('keeps the edition branch free of the EvoDuel block', async () => {
  const result = await renderIndex('http://localhost/?edition=christmas');
  expect(result).not.toContain('Daily missions');
  expect(result).toContain('id="winter-title"');
});

it('names EvoDuel in the home description and keywords', async () => {
  const result = await renderIndex('http://localhost/?edition=off');
  // The Layout mock renders its props; assert on whatever it outputs for description/keywords.
  expect(result).toMatch(/EvoDuel/);
});
```

  - Check `tests/__mocks__/Layout.astro` to see how it renders `description` and `keywords`. If it ignores them, tighten the last test to read them from the mock's output, or extend the mock to print them.
  - The existing "live marquee right after the title, before the news" test must still pass unchanged.

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `bun run test -- tests/pages/IndexPage.test.ts`
Expected: FAIL on the new cases. There is no `EvoDuel` h1 yet.

- [ ] **Step 3: Implement**
  - `src/utils/evoDuel.ts`: exports the two constants. `Download.astro` imports `EVODUEL_VERSION`, and its `link` uses `EVODUEL_URL`.
  - `EvoDuelHero.astro`:
    - a `<section aria-labelledby>` holding the eyebrow, `<h1>EvoDuel</h1>`, the subtitle, the highlights as a `<ul>`, the account line, and the two links with the exact hrefs and umami events;
    - a small version badge `v{EVODUEL_VERSION}`;
    - visual design per the impeccable skill and the project's DaisyUI/Tailwind look. Optionally use EvoDuel artwork, such as `https://evoduel.com/og-image-v3.png` downloaded into `public/banners/`;
    - keep it compact: the whole row must leave room for the marquee at 1366×768, so aim for about 420 px or less on desktop.
  - `index.astro`, no-edition branch:
    - replace the `<h1>` and the leading `<News>` with a grid wrapper, `grid gap-4 mx-4 my-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]`;
    - children in this DOM order:
      1. `<EvoDuelHero season={currentSeason} />`, with `lg:col-start-1 lg:row-start-1`;
      2. `<div class="lg:col-span-2 lg:row-start-2"><Live client:only='svelte' /></div>`;
      3. `<div data-home-news class="lg:col-start-2 lg:row-start-1 lg:min-h-[…]"><News variant="compact" client:only='react' /></div>`.
    - The edition branch stays as is: `EditionHero`, Live, News. Restructure the template so Live renders once per branch.
    - Append `Play instantly in your browser with EvoDuel.` to `description`, and add `'EvoDuel'` to `keywords`.

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `bun run test -- tests/pages/IndexPage.test.ts`
Expected: PASS, including the existing edition and ordering tests.

- [ ] **Step 5: Commit**

```bash
git add src/utils/evoDuel.ts src/components/EvoDuel/EvoDuelHero.astro src/pages/index.astro src/sections/Download.astro tests/pages/IndexPage.test.ts
git commit -m "feat(home): open with the EvoDuel block outside editions"
```

### Task 2: Compact news card

**Files:**
- Modify: `src/sections/News.tsx`
- Test: `tests/sections/News.test.tsx`

**Interfaces:**
- Produces: `export default function NewsSection({ variant = 'full' }: Readonly<{ variant?: 'full' | 'compact' }>)`. `'full'` behaves exactly as today, so the existing tests stay green.

- [ ] **Step 1: Write the failing tests** in `tests/sections/News.test.tsx`

```ts
describe('compact variant', () => {
  it('renders all five news items as compact cards', () => {
    render(<NewsSection variant="compact" />);
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByRole('heading', { name: 'Season 7 is live' })).toBeInTheDocument();
  });

  it('clamps descriptions so every slide keeps one height', () => {
    render(<NewsSection variant="compact" />);
    const description = screen.getByText(/A new season begins/);
    expect(description).toHaveClass('line-clamp-3');
  });

  it('uses its own arrow selectors', () => {
    render(<NewsSection variant="compact" />);
    const props = swiperSpy.mock.calls.at(-1)?.[0];
    expect(props.navigation).toEqual({ nextEl: '.news-compact-next', prevEl: '.news-compact-prev' });
    expect(screen.getByRole('button', { name: 'Previous news item' })).toHaveClass('news-compact-prev');
  });

  it('turns autoplay and transitions off for reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    render(<NewsSection variant="compact" />);
    const props = swiperSpy.mock.calls.at(-1)?.[0];
    expect(props.autoplay).toBe(false);
    expect(props.speed).toBe(0);
    vi.unstubAllGlobals();
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `bun run test -- tests/sections/News.test.tsx`
Expected: FAIL. `variant` is not supported yet.

- [ ] **Step 3: Implement the compact branch in `News.tsx`**
  - Keep a single `news` array.
  - Compact mode wraps the same Swiper config, with the same autoplay and reduced-motion logic, in a small card. Each slide is an `<article>`:
    - an image with a fixed aspect (`aspect-[3/1]`, `object-cover`);
    - an `h2` title;
    - a description `<p className="line-clamp-3">`;
    - the CTA button when `buttonLink` and `buttonText` are present.
  - The arrow buttons use `news-compact-prev` and `news-compact-next`, with the same aria-labels as the full variant.
  - The full variant is unchanged.

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `bun run test -- tests/sections/News.test.tsx`
Expected: PASS. The original full-variant tests are unchanged and also pass.

- [ ] **Step 5: Commit**

```bash
git add src/sections/News.tsx tests/sections/News.test.tsx
git commit -m "feat(news): add a compact card variant"
```

### Task 3: Fold check and visual pass

**Files:**
- Possibly adjust: `src/components/EvoDuel/EvoDuelHero.astro`, `src/sections/News.tsx` and the `index.astro` grid classes. Spacing only.

- [ ] **Step 1: Full verification**

Run: `bun run lint && bun run test && bun run build`
Expected: lint reports no new errors in `src/`, all tests pass, and `astro check` shows 0 errors.

- [ ] **Step 2: Measure the fold**
  - Start `astro dev` and use Playwright to load `/?edition=off` at 1366×768, 1024×768, 768×1024 and 390×844.
  - Record the `top` of the marquee element (`main [class*="marquee"]`).
  - Expected: `top < viewport height` at 1366×768 and at 390×844, with no horizontal overflow at any size.
  - Load `/?edition=christmas` at 1366×768 and confirm it renders as today: hero, then Live, then the full carousel.

- [ ] **Step 3: Screenshot review.** Take screenshots at 1366×768 and 390×844 and look at them. Check that the hierarchy reads EvoDuel first and that the news card doesn't compete with it. Adjust spacing if needed, then repeat Step 2.

- [ ] **Step 4: Commit any adjustments**

```bash
git add -A src
git commit -m "style(home): tune the EvoDuel row spacing"
```
