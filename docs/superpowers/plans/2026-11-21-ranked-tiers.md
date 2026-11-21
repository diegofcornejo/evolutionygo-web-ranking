# Ranked Tiers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the player's ranked tier in the ranking table, the podium cards and the profile, with progress to the next tier.

**Architecture:** Pure helpers in `src/utils/tier.ts` turn API payloads into view data. A `TierEmblem` SVG component is shared by the table, the trading card and a server-rendered `RankCard` on the profile page.

**Tech Stack:** React 19, Astro 5 SSR, Tailwind 4, Vitest + Testing Library, Astro container tests.

**Spec:** `docs/superpowers/specs/2026-11-21-ranked-tiers-design.md`

## Global Constraints

- Copy (English, exact): `Rank`, `Rank pts`, `N more to {Next}`, `Placement C / T games`, `Top N of the ladder`, `Next: Master · top N with M+ games`, `Wins vs N different opponents (C)`, `Also ranked in`, `Elo X · Peak Y`.
- Rank pts note (title attribute): `Rank points decide your rank and are counted separately from ladder points.`
- No tier UI in Global except "Also ranked in" on the profile.
- Commits: subject only, conventional format.

## Review Focus

1. Negative rank points (`current: -1, target: 3`): bar at 0%, remaining `4`. Pinned in Task 1 (`clamps the bar for negative rank points`).
2. Unknown tier id from the API: emblem falls back to the Rookie palette, no crash. Pinned in Task 1 (`falls back for an unknown tier id`).
3. `/ranked-tiers` fails: card still renders, ladder strip hidden. Pinned in Task 3.
4. A profile banlist with no `ratings[]` entry (or `ratings` missing): no rank card, no crash. Pinned in Task 3.
5. Rows mixing tier and no tier in a ladder table: `—` in the Rank cell. Pinned in Task 2.

---

### Task 1: Tier types, helpers and emblem

**Files:** Modify `src/types/Duelist.d.ts`, `src/utils/tier.ts`. Create `src/components/TierEmblem.tsx`. Test `tests/utils/tier.test.ts`, `tests/components/TierEmblem.test.tsx`.

**Interfaces (produces):**
- Types: `TierProgress`, `DuelistTier` gains optional `effectivePoints`, `gamesPlayed`, `progress`, `rating`, `peak`; `RankedTier { id; name; order; kind: 'placement' | 'absolute' | 'relative'; threshold; minGames; distinctOpponentWins; requiresTier; size }`; `DuelistRating { banListName: string; rankType?: string; rating?: number; peak?: number; tier?: DuelistTier | null }`.
- `tierForBanList(ratings: DuelistRating[] | undefined, banListName: string): DuelistRating | null`
- `parseTierLadder(payload: unknown): RankedTier[] | null` (sorted by `order`; null if invalid or empty)
- `tierProgressView(tier: DuelistTier, ladder: RankedTier[] | null): TierProgressView` where
  `TierProgressView = { kind: 'points' | 'games'; current; target; remaining; percent; nextName } | { kind: 'top'; size: number | null } | { kind: 'relative'; nextName; size: number | null; minGames: number | null } | { kind: 'none' }`, plus `distinct: { current; required; met } | null` on every kind.
- `TierEmblem({ tier: string; className?: string; title?: string })` renders an `<svg data-tier-emblem={id}>`, `aria-hidden` unless `title` is given (then `role="img"` + `aria-label`).

- [ ] Step 1: failing tests: `picks the rating entry for the banlist`, `returns null without ratings`, `parses and sorts the ladder`, `rejects an invalid ladder`, `builds points progress`, `builds placement progress`, `clamps the bar for negative rank points`, `shows top N for master`, `describes the relative step to master`, `marks the distinct-opponents requirement`; emblem: `renders one palette per tier`, `falls back for an unknown tier id`, `is decorative unless titled`.
- [ ] Step 2: run `bun run test -- tests/utils/tier.test.ts tests/components/TierEmblem.test.tsx`, expect FAIL.
- [ ] Step 3: implement. Next tier name comes from the ladder, else the id capitalised.
- [ ] Step 4: same command, expect PASS.
- [ ] Step 5: commit `feat(ranks): add tier helpers and a tier emblem`.

### Task 2: Rank column and card emblem

**Files:** Modify `src/sections/Ranking.tsx`, `src/components/Cards/DuelistTradingCard.tsx`. Test `tests/sections/Ranking.test.tsx`, `tests/components/Cards/DuelistTradingCard.test.tsx`.

- [ ] Step 1: failing tests: `shows a Rank column with the tier on ladders`, `shows a dash for a row without a tier`, `hides the Rank column in Global`; card: `shows the tier emblem in the name bar`, `keeps the star without a tier`.
- [ ] Step 2: run both files, expect FAIL.
- [ ] Step 3: implement (`Rank` header after Username).
- [ ] Step 4: expect PASS.
- [ ] Step 5: commit `feat(ranks): show the tier in the ranking table and podium cards`.

### Task 3: Profile rank card

**Files:** Create `src/components/Profile/RankCard.tsx`. Modify `src/pages/duelists/[id]/[banlist].astro`. Test `tests/components/Profile/RankCard.test.tsx`, `tests/pages/DuelistPage.test.ts`.

**Interfaces:** `RankCard({ rating: DuelistRating | null; others: DuelistRating[]; ladder: RankedTier[] | null; season: string; banListName: string; userId: string; username: string })`, returns null when there is neither a tier nor others.

- [ ] Step 1: failing tests: `shows the tier, Elo and rank points progress`, `labels rank points with the note`, `shows placement games for rookie`, `shows top N for master without a bar`, `shows the ladder with the current tier`, `hides the ladder without a catalog`, `links the other ranked formats`, `renders nothing without tiers`; page: `fetches the ladder for the banlist and renders the rank card`, `skips the rank card when the banlist has no rating`.
- [ ] Step 2: run, expect FAIL.
- [ ] Step 3: implement. Page: `fetchJson` `/ranked-tiers?banListName=` (only when not Global) in the existing `Promise.all`; `others` = tiered ratings except the current banlist, deduplicated by name.
- [ ] Step 4: run the files, then `bun run test && bun run build`, expect PASS and 0 errors. Visual check of a TCG profile and a Global profile at 390 and 1366.
- [ ] Step 5: commit `feat(ranks): add a rank card to the profile`.
