# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Yu-Gi-Oh! duelists who play on the Evolution YGO server through EDOPro, Koishi, YGO Mobile, MDPro3 or EvoDuel (evoduel.com). They come to the site to check where they stand in the seasonal ladder, look up their own or a rival's stats, watch live duels, and get a client connected to the server.

## Product Purpose

The community site of a free Yu-Gi-Oh! dueling server. It publishes seasonal rankings per format and ban list, duelist profiles with match history and achievements, server stats, tournaments, live duel spectating, and client downloads and setup. Success is duelists coming back to track their climb and new players getting from the home page into a duel.

## Positioning

A free server with ranked seasons per format (TCG, OCG, GOAT, Edison and others), an Elo rating per format, and its own browser client, EvoDuel, that carries the same account and rank.

## Operating Context

- The home page is the hub: news carousel, live rooms, Duelist of the Week, ranking, features, downloads, FAQ and crew.
- Live data comes from the server API (rankings, rooms over WebSocket); spectating embeds EvoDuel.
- Announcements and matchmaking also happen on the Discord server.
- Seasons reset the ladder; the current season comes from `PUBLIC_DEFAULT_SEASON`.

## Capabilities and Constraints

- Astro SSR on Vercel with React and Svelte islands, Tailwind 4 and DaisyUI 5 themes (`night` default, `dracula`).
- UI copy is in English.
- Seasonal editions (such as Halloween) switch on and off by date range, with no deploy to remove them, and can run again in later years.
- Halloween 2026 edition: decoration only, applied as a site-wide theme plus a featured moment on the home page.

## Brand Commitments

- Name: Evolution YGO. Logo at `public/logo.svg`.
- Gold, silver and bronze tokens mark ranking positions.

## Evidence on Hand

- News banners and season art in `public/banners/`.
- Crew photos in `public/crew/`.
- Real rankings, stats and live rooms come from the server API at runtime.
- There is no Halloween event, tournament, prize or in-game reward in 2026. Seasonal work must not announce or imply one.

## Product Principles

- The ranking and the duelists are the content; decoration never hides or slows the data.
- Never invent events, prizes or claims the server does not offer.
- Seasonal touches come and go on their own and leave the everyday site untouched.

## Accessibility & Inclusion

- Motion respects `prefers-reduced-motion` (the news carousel already does).
