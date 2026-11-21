# Ranked tiers across the site

Date: 2026-11-21. Size: small project. Approved from the mockup (table column + profile rank card).

## Intent

The API ranks every ladder player Rookie → Master, with progress to the next tier, and the site only shows the tier name on the podium cards. Show it where people look for standing: the ranking table and the profile, so a player sees their rank and what it takes to climb.

## Data (checked live, 2026-11-21)

- `GET /stats` rows carry `tier: { id, name, effectivePoints, gamesPlayed, progress, rating?, peak? }`. `tier` is null in Global.
- `GET /users/{id}/stats` does **not** carry `tier` at the root, despite the spec. It carries `ratings[]`, one entry per banlist and per group (`banListName`, `rankType`, `tier`). The profile takes the entry whose `banListName` equals the page's banlist.
- `progress`: `{ nextTierId, unit: 'points' | 'games', current, target, distinctOpponentWins: { current, required } | null }`, or null for Master and for Diamond (Master is relative: top N).
- `effectivePoints` can be negative and differs from ladder `points` (e.g. 16 points, 29 rank points). It is labelled **Rank pts**, with a note that it is counted separately from ladder points. How it is computed is not documented, so the copy does not explain it.
- `GET /ranked-tiers?banListName=X` gives the ladder: `tiers[]` with `order`, `kind` (`placement` | `absolute` | `relative`), `threshold`, `minGames`, `distinctOpponentWins`, `requiresTier`, `size`.

## Decisions

- **Emblem:** our own hexagonal gem, one colour pair per tier. evoduel.com publishes no tier icons.
- **Table:** a `Rank` column (emblem + name) on ladders, hidden in Global. `—` when a row has no tier. The stars stay.
- **Podium cards:** the emblem replaces the ★ in the name bar when the duelist has a tier.
- **Profile rank card** (right column, between the stat tiles and achievements):
  - emblem, tier name, `Season N · banlist`, `Elo X · Peak Y` when present;
  - progress by case:
    - points: bar `Rank pts current / target`, `N more to Next`;
    - games (Rookie placement): `Placement current / target games`;
    - Master: `Top N of the ladder` (N from the ladder's `size`), no bar;
    - Diamond (null progress): `Next: Master · top N with M+ games`, no bar;
  - the distinct-opponents requirement as a chip, ticked when met;
  - the ladder strip from `/ranked-tiers` (done / current / locked). Hidden if the catalog fails;
  - "Also ranked in": the player's other tiered `ratings[]` entries this season, linking to that banlist's profile.
  - Global profiles show only "Also ranked in"; no card when there is nothing to show.
- The bar clamps to 0–100%, and negative rank points show as they come.

## Approaches considered

1. **Chosen:** one `TierEmblem` component plus pure helpers in `src/utils/tier.ts` (pick tier from ratings, parse the catalog, build the progress view), consumed by the table, the card and a server-rendered `RankCard`.
2. Compute progress on the client from the catalog. Rejected: the API already sends progress, and the catalog has per-ladder overrides.
3. Official icons from the game client. Rejected: not published.

## Non-goals

Rank history, rank-ups notifications, tiers in Global, explaining how rank points are computed.
