# Ranking top as a podium of YGO-style cards

Date: 2026-11-20. Size: medium change (one new component plus a reshuffle of the ranking top).

## Intent

Make the ranking catch the eye of people visiting the site. Today the top 4 are four identical dark boxes: an initials circle, win-rate stars and a stat list, with the #3 and #4 borders both orange. The user wants the top to look like Yu-Gi-Oh! cards and to have more presence.

The Elo issue the user reported is not a bug. The API returns `rating: null` for Global because Global has no Elo ladder. Global is the default view, though, so every visitor first sees a column of dashes, and "Sort by Elo" sorts nothing there.

## Decisions

### Podium (option C)

- The top 3 become cards in a podium.
- **Desktop:** #1 sits in the center, bigger and with an animated foil. #2 is on the left and #3 on the right, both lower.
- **Mobile (option 1):** #1 large on top (about 58% of the width), with #2 and #3 side by side below.
- The DOM order is #1, #2, #3. Grid order places them visually on desktop, so keyboard and screen-reader order follow the ranking.
- #4 moves to the table, which now starts at position 4 (`data.slice(0, 3)` for the podium, `data.slice(3)` for the table).

### The card

Our own frame, drawn with CSS. Do not use Konami's templates, frame artwork or fonts.

- **Name bar:** the display name (keeps the existing "(You)" suffix), truncated with a `title`.
- **Position badge:** 1, 2 or 3.
- **Level stars:**
  - On a ladder, they come from the API tier: rookie 1, bronze 2, silver 3, gold 4, platinum 5, diamond 6, master 7 (tier `order + 1`).
  - In Global, where there is no tier, they come from win rate using the existing `winRateStars()` (1–5).
- **Art:** the player's initials on a gradient.
- **Type line:** `[Duelist / <Tier name>]` on ladders, `[Duelist]` in Global.
- **Text box:** wins, losses and win rate. Use `formatWinRate`, so a null win rate shows `—`.
- **Bottom line**, in the style of ATK/DEF:
  - On ladders: `PTS/<points>  ELO/<rating>`. A null rating shows `ELO/—`. A provisional Elo shows the existing `?` marker.
  - In Global: `PTS/<points>  WIN%/<win rate>`.
- **Frame colour by position:** gold, silver, bronze.
- **Hover:** the card tilts with the pointer and gets a foil sheen. #1's foil is animated all the time; #2 and #3 only shine on hover.
- With `prefers-reduced-motion`, there is no tilt and no animated foil.
- The card stays a link to the player's profile, with the same URL as today.

### Global and Elo

- When the selected ban list is Global, hide the table's Elo column and the "Sort by Elo" option.
- If the sort is `rating` when the user switches to Global, reset it to `points`.

### Data

- The stats endpoint already sends a top-level `tier` on ladders: `{ id, name, … } | null`, null in Global.
- Add `tier?: { id: TierId; name: string } | null` to the `Duelist` type.

## Approaches considered

1. **Chosen:** a new React component, `DuelistTradingCard`, with the frame in Tailwind plus a little scoped CSS for the foil, and a small pointer hook for the tilt. The podium is laid out in `Ranking.tsx`, which is already React and already has the data. There are no new dependencies, and the text stays real HTML: readable, accessible and testable.
2. An SVG-drawn frame. Rejected: fitting dynamic text (long names, numbers) inside an SVG is fragile and harder to keep responsive.
3. A 3D or holo library such as react-parallax-tilt or Atropos. Rejected: it adds a dependency for an effect a few lines of CSS achieve, and gives less control over reduced motion.

Also considered for the layout: four cards in a row (A), and a podium without the card metaphor (B). The user picked C. For mobile, a swipe carousel was considered; the user picked "#1 on top, #2 and #3 side by side".

## Non-goals

- Using the player's EvoDuel avatar as card art. Few players have one equipped, and the lookup by display name fails for some, so it can come later.
- The Duelist of the week card.
- A table redesign beyond hiding Elo in Global.

## Anti-goals

- Copying official card artwork, fonts or exact templates.
- Motion for users who asked for reduced motion.
- Cards that are hard to read on mobile.

## Edge cases

- A ban list with fewer than 3 players renders a podium with only the players that exist, centered.
- Long names truncate.
- A null win rate shows `—`.

## Acceptance

- **Tests:**
  - card content on a ladder (tier stars, type line, PTS/ELO, provisional marker);
  - card content in Global (win-rate stars, `[Duelist]`, PTS/WIN%);
  - podium DOM order and position badges;
  - the table starts at #4;
  - Global hides the Elo column and the "Sort by Elo" option, and resets a `rating` sort;
  - fewer than 3 players;
  - reduced motion turns off tilt and foil.
- **Visual check** in a browser at 1366×768 and 390×844.
- `bun run build` and `bun run test` pass.

## Left to the builder

- The exact frame styling: bevels, inner borders, the "attribute" circle and the parchment text box, within the "our own frame" constraint. Follow the project's DaisyUI and Tailwind look.
- The foil gradient and the tilt angle (around ±8°).
- Exact card sizes, as long as the podium fits at 1366×768 and mobile matches option 1.
