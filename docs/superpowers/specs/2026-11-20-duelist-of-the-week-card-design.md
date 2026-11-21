# Duelist of the week as a card beside the podium

Date: 2026-11-20. Size: small change, extending `2026-11-20-ranking-card-podium-design.md`.

## Intent

The user wants the player of the week in the ranking podium, as part of the same "board" of cards. The separate "Player of the Week" strip above the ranking goes away.

## Decisions (option A from the mockups)

- **A fourth card beside the podium**, separated from it by a thin divider: #2, #1, #3, divider, weekly card on desktop. On mobile it sits below #2 and #3, centered, about the size of #2.
- **Its own holographic frame** (a multicolour conic gradient). The weekly player is global and weekly and does not change with the season or ban-list filters, so it must not read as a fourth podium place.
- **Ribbon** `DUELIST OF THE WEEK` in place of the position badge.
- **Content:**
  - name;
  - level from win rate (`cardLevel` with no tier);
  - initials art;
  - type line `[<from> – <to>]`, the week range formatted `MMM d` in UTC, e.g. `[Nov 9 – Nov 15]`;
  - text box `<wins> wins · <losses> losses · <win rate> win rate`;
  - bottom line `PTS/<points>`.
- **Link:** the same target as today, `/duelists/<userId>/Global?username=<username>&season=<PUBLIC_DEFAULT_SEASON>`.
- **Data:**
  - `Ranking.tsx` fetches `GET /stats/player-of-the-week` once on mount, not on filter changes.
  - It uses the first item. The API sends `points`, `wins` and `losses` as strings, so convert them.
  - Win rate is wins / (wins + losses), null when both are 0.
  - If the request fails or returns nothing, the card and the divider are simply not shown.
- **Remove** `DuelistOfTheWeek.astro` and its use in `index.astro`.
- **Motion:** the same tilt, foil and reduced-motion behavior as the podium cards. The holo frame does not animate when reduced motion is on.

## Approaches considered

1. **Chosen:** extend `DuelistTradingCard` with a weekly variant: an optional `weekly: { from: string; to: string }` prop that switches the frame, the ribbon, the type line and the bottom line. It reuses the frame, tilt, foil and tests.
2. A separate `WeeklyDuelistCard` component. Rejected: it duplicates the frame, tilt and foil.
3. Keeping it server-rendered in Astro, next to the React podium. Rejected: the podium is a React island, so the card would sit outside its grid and the layout would split.

## Non-goals

- Weekly winners per ban list. The API only has the global weekly.
- History of past weekly winners.

## Acceptance

- **Tests:**
  - the weekly card content (ribbon, date range, PTS, holo frame, link);
  - it is hidden when the endpoint fails or is empty;
  - it is fetched once and not refetched on filter changes;
  - the index page no longer renders the old strip.
- **Visual check** at 1366×768 and 390×844, with no overflow.
