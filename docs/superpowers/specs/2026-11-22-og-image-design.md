# Season-aware share image (Open Graph)

## Why

Sharing evolutionygo.com on WhatsApp (and Discord, X, Telegram) shows `/banners/banner1.webp`, the old
"Welcome Season 4" Yusei banner. The title and description already follow `PUBLIC_DEFAULT_SEASON`
(they say Season 7). The image is hardcoded and the site no longer uses that art anywhere else.
The share image should follow the current season by itself, with no one drawing a new banner each season.

## Goals

- A 1200×630 PNG share card in the site's current look, showing the current season number.
- It updates itself when `PUBLIC_DEFAULT_SEASON` changes (on the next deploy).
- It replaces `banner1.webp` as the default share image everywhere it was used for that.
- The share text drops "Yu-Gi-Oh" too: the home description in `index.astro` and `DEFAULT_DESCRIPTION` in
  `SEO.astro` say "YGO" instead (approved by the user). The SEO `keywords` lists are left as they are.

## Non-goals

- Per-page cards (player profile, tournament). Profiles keep their current image for now.
- Holiday variants (Halloween, Día de Muertos, winter, new year).
- Rendering on every request.

## Anti-goals

- The words "Yu-Gi-Oh" anywhere on the card. Say "YGO".
- Decorative illustrations that feel random. The user rejected those before; keep the card plain and on-brand.
- Any new runtime dependency in the Vercel function (the adapter has broken prod before).

## Approaches considered

1. **Card generated from code at build time** (picked). Always current, matches today's site, adds
   build-only dependencies.
2. Yusei template (`banner_no_season_v1.webp`) with the number drawn on top. Fast, but keeps art the site
   has moved away from.
3. One static image per season picked by the env var. No dependencies, but someone has to design it each
   season, and a forgotten one shows a stale image again.

## Design

A prerendered Astro endpoint renders the card at build time with Satori (text to SVG paths, so fonts do not
depend on the build machine), then rasterizes it to PNG.

- URL includes the season: `/og/season-7.png`. A new season gets a new URL, so CDNs and crawlers don't
  serve the old image from cache. `getStaticPaths` returns just the current season.
- `SEO.astro` and `Layout.astro` default to that URL. `index.astro`, `stats.astro` and `watch.astro` stop
  passing `banner1.webp` and use the default.
- `SEO.astro` adds `og:image:width` (1200), `og:image:height` (630), `og:image:type` (`image/png`) and
  `og:image:alt` for the default card.

Card layout (dark, purple, same palette as the site):

```
┌──────────────────────────────────────────────────────────┐
│ [Evolution logo]                                         │
│                                                          │
│ SEASON 7                                                 │
│ YGO duels in your browser                                │
│ EvoDuel · EDOPro · Koishi · YGO Mobile                   │
│                                                          │
│                                      evolutionygo.com    │
└──────────────────────────────────────────────────────────┘
  background: public/profile/banner-1920.webp (official arcane art),
  covered and darkened toward the left so the text reads
```

Everything important sits inside the center, because some apps crop the edges.

## Constraints

- Satori takes TTF/OTF/WOFF, not WOFF2. The installed Plus Jakarta Sans is WOFF2 only.
- Satori does not embed WebP. Background and logo must be converted (e.g. with sharp) before embedding.
- `logo.svg` styles its paths with CSS classes. Rasterize it to PNG first instead of trusting the SVG
  renderer with `<style>`.
- Keep the PNG under ~300 KB. WhatsApp can drop large previews.

## Left to the builder

- Which renderer turns the SVG into a PNG: sharp (already installed through Astro) or `@resvg/resvg-js`.
- How to get a non-WOFF2 font (a `@fontsource` static package with `.woff` files is one way).
- Exact type sizes, spacing and gradient, within the sketch above.
- Whether to keep `banner1.webp` (tournament mock data still uses banner1 to banner3, so don't delete it).

## Note for the user

WhatsApp caches a URL's preview for a while. Links already shared may keep the old image until that cache
expires.
