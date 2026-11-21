# EvoDuel at the top of the home page

Date: 2026-11-20. Size: small change.

## Intent

EvoDuel (https://evoduel.com) is the official browser client, but the site barely shows it. Outside seasonal editions the home opens with a plain "Evolution YGO Season 7" title and a 514 px news carousel. EvoDuel is one card among five clients further down. The home description and keywords don't name it, and neither does the Features section.

Goal: a visitor landing on the home sees EvoDuel first and learns why to play it, with the live duels still in the first screen. Today, on a 1366×768 laptop, the live duels start at 766 px, so they are not visible.

## Decisions

- **Layout (option C from the mockups):** this applies only when no seasonal edition is active. The "Evolution YGO Season N" `h1` and the full News carousel are replaced by one row:
  - left: the EvoDuel block;
  - right: a compact News card with the same news items.
  - The live duels marquee sits directly below the row. Everything after it stays as it is: Duelist of the week, Ranking, Features, Download, FAQ and Crew.
- **Seasonal editions are untouched.** The edition hero, then Live, then the full News carousel below, exactly as today. In effect, option C splits today's news block vertically and leaves the edition branch alone.
- **Mobile order:** EvoDuel, then Live, then the News card, so the live duels stay in the first screen.
- **Copy (English, like the rest of the site):**
  - eyebrow: `Evolution YGO · Season {N}`;
  - `h1`: `EvoDuel`. The user picked a brand-led headline. Avoid "Play Yu-Gi-Oh!" as the headline, since no other platform leads with it;
  - subtitle: `YGO duels in your browser. Against players or the AI, on phone or desktop.`;
  - highlights: Duel the AI · Phone & desktop · No install · Daily missions · Essence & shop · Cosmetics & emotes;
  - account line: `Play without an account. Sign in to earn rewards.` evoduel.com says "no account", but missions, essence and the shop need a login, so the copy must not suggest rewards work without one.
- **Buttons:**
  - `Play now` goes to `https://evoduel.com`, with an umami event such as `home-click-evoduel-play`;
  - `Other clients` goes to `#section-download`, with an umami event.
- **SEO:** add "EvoDuel" to the home `description` and `keywords`. Keep the existing wording otherwise.

## Approaches considered

1. **Chosen:** a static Astro component for the EvoDuel block, plus a compact variant of the existing React `News` component. Only the no-edition branch of `src/pages/index.astro` changes. The block's text ships in the HTML for search engines, the same way today's `h1` does, and the edition branch keeps the full carousel.
2. Build the whole row in React. Rejected: the EvoDuel text would only appear after the JavaScript loads, which is worse for search engines and adds weight.
3. Give the block the look of each seasonal edition so the live duels are always in the first screen. Rejected once the user pointed out that editions already work this way: their hero takes the slot and News moves below Live.

Also considered: making EvoDuel the full-width hero with News right below (option A), or moving News to the end (B). The user picked C.

## Non-goals

- No `/play` page.
- No changes to the seasonal editions, the Download section or the nav.
- No API integration. Missions, essence and the shop are described, not fetched.

## Anti-goals

- The live duels end up outside the first screen at 1366×768 or 390×844.
- The copy promises something EvoDuel does not do, such as rewards without an account.
- The block gets so tall that it becomes the 514 px carousel again.

## Acceptance

- At 1366×768 and 390×844 the live duels marquee starts above the fold, on the default home with no edition.
- With `?edition=christmas` (and the other editions) the page renders as today.
- All 5 news items are reachable in the compact card. Autoplay respects `prefers-reduced-motion`, as it does today.
- Tests cover the EvoDuel block, the compact News variant and both branches of the index page. `bun run build` and `bun run test` pass.

## Left to the builder

- Visual design, following the project's DaisyUI and Tailwind conventions and the impeccable skill. This includes whether the block uses EvoDuel artwork; evoduel.com's `og-image-v3.png` is an option.
- How to get "row on desktop, Live between on mobile". One way: a grid wrapper in `index.astro` around the block, News and Live, with different areas per breakpoint, so no component renders twice.
- Whether to show the EvoDuel version badge. That means moving `evoDuelVersion` out of `Download.astro` into a shared module.
