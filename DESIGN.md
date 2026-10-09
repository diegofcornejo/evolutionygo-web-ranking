---
name: Evolution YGO
description: Ranked Yu-Gi-Oh! dueling ladder on a dark DaisyUI night ground, with date-activated seasonal editions layered on top.
colors:
  night-base-100: "oklch(20.768% 0.039 265.754)"
  night-base-200: "oklch(19.314% 0.037 265.754)"
  night-base-300: "oklch(17.86% 0.034 265.754)"
  night-base-content: "oklch(84.153% 0.007 265.754)"
  night-primary: "oklch(75.351% 0.138 232.661)"
  night-secondary: "oklch(68.011% 0.158 276.934)"
  night-accent: "oklch(72.36% 0.176 350.048)"
  night-neutral: "oklch(27.949% 0.036 260.03)"
  page-ground: "#13151a"
  rank-gold: "#FFD700"
  rank-silver: "#C0C0C0"
  rank-bronze: "#CD7F32"
  shadowrealm-void: "#0b0612"
  shadowrealm-base-100: "#120a1c"
  shadowrealm-base-200: "#170d24"
  shadowrealm-base-300: "#1d112e"
  shadowrealm-neutral: "#271a3d"
  shadowrealm-ink: "#ece4ff"
  shadowrealm-ecto: "#9dff6a"
  shadowrealm-violet: "#8a5cff"
  shadowrealm-lilac: "#c9b2ff"
  shadowrealm-fog-deep: "#4b3277"
  shadowrealm-fog-pale: "#b9a3e6"
  shadowrealm-fog-floor: "#3d2a63"
  shadowrealm-night-ahead: "#6a52a0"
  shadowrealm-night-past: "#b39ae8"
  shadowrealm-bolt: "#f3edff"
  shadowrealm-bolt-glow: "#a58cf0"
  shadowrealm-lit-face: "#9d84d6"
  shadowrealm-pyramid-far-lit: "#1c1130"
  shadowrealm-pyramid-far-shade: "#190f2b"
  shadowrealm-pyramid-right-lit: "#140b22"
  shadowrealm-pyramid-right-shade: "#110a1d"
  shadowrealm-pyramid-left-lit: "#120a1f"
  shadowrealm-pyramid-left-shade: "#0e0818"
  shadowrealm-warning: "#ffcf5c"
  shadowrealm-error: "#ff6b8a"
  shadowrealm-info: "#8fb8ff"
typography:
  body:
    fontFamily: "'Plus Jakarta Sans Variable', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.6
  headline:
    fontFamily: "'Plus Jakarta Sans Variable', system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: "'Plus Jakarta Sans Variable', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  label:
    fontFamily: "'Plus Jakarta Sans Variable', system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 600
    letterSpacing: "0.04em"
    fontFeature: "'tnum'"
  edition-display:
    fontFamily: "'Grenze', 'Plus Jakarta Sans Variable', serif"
    fontSize: "clamp(3.6rem, 13.5vw, 12.5rem)"
    fontWeight: 700
    lineHeight: 0.82
    letterSpacing: "-0.01em"
  edition-brand:
    fontFamily: "'Grenze', 'Plus Jakarta Sans Variable', serif"
    fontSize: "clamp(1.6rem, 3.2vw, 2.6rem)"
    fontWeight: 700
    lineHeight: 1
  edition-lede:
    fontFamily: "'Plus Jakarta Sans Variable', system-ui, sans-serif"
    fontSize: "clamp(1.05rem, 1.6vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  field: "0.5rem"
  box: "1rem"
  selector: "1rem"
  pill: "999px"
spacing:
  edition-gap: "1.75rem"
  edition-actions-gap: "0.75rem"
  card-pad: "1.5rem"
  card-pad-lg: "3.5rem"
  footer-pad: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.night-primary}"
    textColor: "{colors.night-base-100}"
    rounded: "{rounded.field}"
  card:
    backgroundColor: "{colors.night-base-300}"
    textColor: "{colors.night-base-content}"
    rounded: "{rounded.box}"
    padding: "{spacing.card-pad}"
  footer:
    backgroundColor: "{colors.night-base-300}"
    textColor: "{colors.night-base-content}"
    padding: "{spacing.footer-pad}"
  edition-button-primary:
    backgroundColor: "{colors.shadowrealm-ecto}"
    textColor: "{colors.shadowrealm-void}"
    rounded: "{rounded.field}"
  edition-button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.shadowrealm-ink}"
    rounded: "{rounded.field}"
  edition-night-mark:
    rounded: "{rounded.pill}"
    width: "0.3rem"
    height: "1.1rem"
  edition-night-mark-tonight:
    backgroundColor: "{colors.shadowrealm-ecto}"
    rounded: "{rounded.pill}"
    width: "0.45rem"
    height: "2.25rem"
---

# Design System: Evolution YGO

## Overview

**Creative North Star: "The Arena After Dark"**

Evolution YGO is a dark-ground competitive site: a ranked ladder, live duel rooms, player stats and downloads, all set on DaisyUI's `night` theme with Plus Jakarta Sans throughout. The everyday world is quiet and utilitarian: deep blue-slate surfaces stacked by tone, rounded DaisyUI cards and buttons, sky-blue primary actions, and three metal colors (gold, silver, bronze) that belong only to ranking position. A navbar toggle swaps to DaisyUI's `dracula` theme as the reader's opt-out.

On top of that world the site runs **seasonal editions**: date-activated skins that take over the whole site for a fixed window each year with no deploy to start or end them. The first is the Halloween edition, "Sent to the Shadow Realm" (October 1 to November 2, UTC): a violet-black void ground, drifting procedural violet fog, ectoplasm green as the only emitted light besides rank gold, an original eye sigil, and Grenze display caps against the incumbent sans. The edition repaints; it never re-lays-out the data. The ladder, live rooms and stats read exactly as they do every other day.

This document records two layers and keeps them separate: **The Everyday World** (always on) and **The Seasonal Edition System** (scoped, temporary, opt-out-able). Anything prefixed `night-`, `page-` or `rank-` belongs to the everyday world; anything prefixed `shadowrealm-` or `edition-` exists only under `html[data-edition='halloween']`.

**Key Characteristics:**
- Dark-only: both everyday themes (`night`, `dracula`) and the edition theme (`shadowrealm`) are `color-scheme: dark`.
- Depth by tonal layering (base-100 / 200 / 300), not by shadow systems.
- Rank metals are semantic, not decorative: gold, silver, bronze mean 1st, 2nd, 3rd.
- Editions activate by date in UTC, are previewable with `?edition=halloween`, suppressible with `?edition=off`, and are always CSS-scoped under `html[data-edition]`.
- Edition atmosphere (fog) lives at the edges of the page (hero, footer), never over data.

## Colors

The everyday world is a cool slate-blue night with a sky-blue primary; the Halloween edition swaps it for a violet void where only ecto green emits.

### Primary
- **Night Sky Blue** (`night-primary`): the everyday action color, from the DaisyUI `night` preset. Primary buttons, active nav item, banner accent bar, footer GitHub link, avatar ring.
- **Ectoplasm Green** (`shadowrealm-ecto`): the edition's primary and its only emitted light. Primary CTA, the "tonight" night mark, the Oct 31 outline and its numeral, the sigil pupil, text selection, caret, focus outline, `accent-color`.

### Secondary
- **Night Violet** (`night-secondary`): everyday secondary; footer social icon hover.
- **Sigil Violet** (`shadowrealm-violet`): edition secondary; the eye sigil stroke. Not used for text.
- **Lilac** (`shadowrealm-lilac`): edition accent; the small "Evolution YGO" brand line and the nights caption.

### Tertiary
- **Rank Gold** (`rank-gold`), **Rank Silver** (`rank-silver`), **Rank Bronze** (`rank-bronze`): defined in the global `@theme` and used as text and border colors for positions 1 to 3 on ranking cards. They keep their meaning under every theme and edition.

### Neutral
- **Page Ground** (`page-ground`): the `html` background behind everything, set in the layout. Under the edition it is replaced by `shadowrealm-base-100`.
- **Night Base 100 / 200 / 300** (`night-base-*`): surface ladder; 300 is the card, banner, dropdown and footer surface.
- **Night Base Content** (`night-base-content`): body text on night surfaces. Much of the home page sets literal white text on `main`; see drift.
- **Void** (`shadowrealm-void`): the darkest edition value; hero gradient top and the content color on every filled edition button.
- **Shadowrealm Base 100 / 200 / 300 / Neutral** (`shadowrealm-base-*`, `shadowrealm-neutral`): the edition's violet-black surface ladder, mapped onto the same DaisyUI roles so cards and footer re-tint without markup changes.
- **Shadowrealm Ink** (`shadowrealm-ink`): edition body text; the lede uses it at 82% opacity, the outline CTA border at 35%.
- **Fog Deep / Fog Pale / Fog Floor** (`shadowrealm-fog-deep`, `shadowrealm-fog-pale`, `shadowrealm-fog-floor`): tints for the fog masks (back layer and trail, front layer, footer floor). They color fog only.
- **Night Ahead / Night Past** (`shadowrealm-night-ahead`, `shadowrealm-night-past`): the nights row marks still to come (about 3:1 on the hero ground) and already gone.
- **Pyramids** (`shadowrealm-pyramid-*`): three silhouettes on the hero horizon, each with a lit face (toward the storm) and a shade face. They stay darker than the sky glow behind them (silhouettes); the far one, low behind the title, is the haziest. The lit/shade split is barely visible until a strike lights it.
- **Storm** (`shadowrealm-bolt`, `shadowrealm-bolt-glow`, `shadowrealm-lit-face`): the lightning core, its wide faint underlay stroke, and the wash a strike throws on its pyramid's lit face. The sky sheet behind a strike reuses Sigil Violet through a blur.

### Named Rules
**The Light Discipline Rule.** Under the Halloween edition only two things emit steadily: ectoplasm green and rank gold. Every other edition color is violet, lilac or ink and reads as lit-by, never as a light source. A new green or glowing element must be the single most important action or state on its screen. The one exception is the storm: lightning emits pale violet-white, but only for a fraction of a second per strike, and only in the hero sky.

**The Safe Storm Rule.** Each strike is two flickers in about 0.35s, on 7, 9 and 11 second cycles, so aligned strikes can briefly reach four flickers in one second. Safety rests on area, not count: only the thin bolts change by 0.1 relative luminance or more (about 5% of the WCAG general-flash area), the sky sheet stays a low-contrast violet and a lit face peaks below a 0.1 change. Never brighten the sheet or the lit faces without re-measuring. Bolts sit beside the title, never across text; strikes stop under `prefers-reduced-motion`, with the hero's pause control, and while the hero is off-screen.

**The Metal Means Rank Rule.** Gold, silver and bronze are reserved for ranking position 1, 2, 3. Never use them as general accents, in either world.

**The Same Roles Rule.** An edition theme re-maps DaisyUI's existing roles (base, primary, secondary, accent, neutral, status). It does not add parallel class names, so every everyday component re-tints for free.

## Typography

**Body Font:** Plus Jakarta Sans Variable (with system-ui, sans-serif)
**Edition Display Font:** Grenze 700 (with Plus Jakarta Sans Variable, serif), Halloween edition only

**Character:** One geometric humanist sans carries the whole everyday site, in bold for headings and regular for reading. The edition adds a single blackletter-tinged serif in caps, used only at display scale, so the contrast is size and texture rather than a second reading face.

### Hierarchy
- **Edition Display** (Grenze 700, clamp(3.6rem, 13.5vw, 12.5rem), line-height 0.82, uppercase, single line): "Season N" in the edition hero only. Its lower half fades by mask into the fog.
- **Edition Brand** (Grenze 700, clamp(1.6rem, 3.2vw, 2.6rem), line-height 1, lilac): the small "Evolution YGO" line set above the display word inside the same h1.
- **Headline** (Plus Jakarta Sans 700, 1.875rem rising to 3rem at md, tight leading): section and page h1/h2 (Ranking, Download, Stats, Faqs, banner titles at up to 3rem on desktop).
- **Title** (Plus Jakarta Sans 700, about 1.5rem): card titles, profile headers, sub-sections.
- **Body** (Plus Jakarta Sans 400, 1.25rem / 1.6 on the home `main`; 1rem to 1.125rem in cards): reading text. Ledes cap at 38ch (edition) and about 36rem (banner description), with `text-wrap: pretty`.
- **Label** (Plus Jakarta Sans 600, 0.85rem, 0.04em tracking, tabular numerals): captions and counters such as "Night 9 of 17". Numbers in counters always use tabular figures.

### Named Rules
**The One Display Face Rule.** A seasonal edition may bring one display face for its hero, loaded only when the edition is active (preloaded as a single woff2 weight in the layout). Body, UI, tables and data stay in Plus Jakarta Sans in every edition.

**The Solid Heading Rule.** Under an edition, headings are solid ink. The edition neutralizes every incumbent gradient-text heading to `shadowrealm-ink`; new edition work never introduces gradient text.

## Layout

The home page is a single centered column of full-width sections (`main` at full width, centered text for heroes), each section owning its own internal grid: the live-rooms marquee, the News carousel of banners, Duelist of the Week, the ranking card grid (one to three columns), a Features hero split one-third copy / two-thirds card grid at `lg`, Download, FAQs and Crew. DaisyUI `hero`, `card` and `footer` primitives set most container behavior; Tailwind breakpoints (sm 640px, md 768px, lg 1024px) drive the responsive changes.

The edition hero is a full-bleed, centered vertical stack: sigil, h1 lockup, then a body column with a 1.75rem gap holding lede, nights row and the CTA pair (0.75rem gap, wrapping). Vertical padding uses viewport-relative clamps (top clamp(2.5rem, 7vh, 4.5rem), bottom clamp(2.5rem, 6vw, 4.5rem)). Below 640px the fog masks stretch to full width and the nights row tightens to a 0.28rem gap so all 17 marks stay on one line.

## Elevation & Depth

The everyday world is tonal: surfaces step from base-100 to base-300, and DaisyUI's `--depth: 0` and `--noise: 0` keep components flat. Shadows that do appear are incumbent Tailwind presets (`shadow-xl` on duelist cards, `shadow-2xl` on banners, `shadow-lg shadow-primary/20` under the banner CTA) used as soft ambient lift, not a structured scale.

The Halloween edition replaces lift with **atmospheric depth**: two fog layers drift at different speeds in front of and behind the display word, a third trails the hero into the next section, and a fog floor rises from the top edge of the footer. Fog is a procedural, tileable WebP noise texture used as a `mask-image` and tinted by the element's background color, so one asset gives any hue.

### Shadow Vocabulary
- **Card ambient** (`shadow-xl`): duelist and ranking cards.
- **Banner ambient** (`shadow-2xl`): news banners.
- **Primary CTA glow** (`shadow-lg` at primary/20): the banner call to action only.

### Named Rules
**The Fog Depth Axis Rule.** Fog is thickest at the hero and footer edges and thins to nothing before data. Never place fog over the ladder, live rooms, stats, tables or any text the reader must read.

**The Transform-Only Drift Rule.** Fog moves only by `transform: translateX` on a double-width layer (80s to 140s linear loops, opposite directions for parallax), and every drift stops under `prefers-reduced-motion: reduce`. No animated masks, filters or background-position on large layers.

## Shapes

DaisyUI's radius tokens govern everything: fields and buttons at 0.5rem, boxes and cards at 1rem, selectors (toggles, badges) at 1rem. Pills (`rounded-full`) are used for avatars, small indicators, the banner accent bar and the edition night marks. Borders are hairline (1px DaisyUI border; banners at white/10). The edition keeps the exact same radius tokens as `night`, so the shape language never changes with the season; only the eye sigil introduces an original silhouette, drawn as a 2px stroke SVG.

## Components

### Buttons
- **Shape:** gently rounded (0.5rem, DaisyUI field radius).
- **Primary:** DaisyUI `btn btn-primary`, filled with the active theme's primary (night sky blue every day, ecto green under the edition) and its matching dark content color.
- **Outline (edition secondary):** transparent with an ink border at 35% and ink text; on hover the border goes to full ink and the fill to ink at 8%.
- **Ghost / circle:** navbar avatar and icon triggers.
- **Sizing:** edition hero CTAs use `btn-lg`; banner CTAs are full width below `sm`, auto above.

### Cards / Containers
- **Corner Style:** 1rem (box radius).
- **Background:** base-300; duelist cards hover to neutral over 200ms.
- **Border:** ranking cards carry a 2px border in a rank metal for positions 1 to 3; banners a white/10 hairline.
- **Internal Padding:** 1.5rem on banners at base, 2rem at `sm`, 3.5rem at `lg`.

### News Banner (signature)
A full-width card with a blurred, scaled copy of its own image as a backdrop, the sharp image contained to the right 72% on desktop, a left-to-right base-300 scrim and a primary/20 bottom glow, then a copy column (max 58%) with a short primary pill bar, a bold balanced h2, a pretty-wrapped description at white/85, and a primary CTA with a nudging chevron.

### Navigation
DaisyUI `navbar` with a horizontal menu; the active item is primary-colored on a raised chip. On the right: the theme toggle (`theme-controller`, value `dracula`), the announcements bell with a primary dot indicator, and Login / Register outline buttons or the avatar dropdown (base-300 menu, primary border).

### Footer
Two stacked DaisyUI footers on base-300: a three-column link block (`footer-title` headings) and a bottom bar with credits and social icons that hover to secondary. Under the edition the upper footer gains the fog floor.

### Shadow Realm Hero (edition signature)
Eye sigil (violet stroke, ecto pupil), the two-line Grenze h1 sinking into front and back fog, a lede, the nights row (one mark per night of the window) and the CTA pair. Only rendered on the home page when the edition is active; otherwise the home shows its everyday h1.

### Nights Row (edition signature)
An ordered list with one thin pill mark per night of the window, bottom-aligned. States: **ahead** (dim violet #6a52a0, 0.3rem by 1.1rem), **past** (pale lilac #b39ae8), **halloween** (Oct 31: taller, hollow, 2px ecto inset outline with a small tabular "31" beneath), **tonight** (wider and tallest, solid ecto, `aria-current="date"`). The server renders by UTC date and a small inline script re-resolves "tonight" in the visitor's own timezone. A live caption reads "Night N of 17", or the whole span outside the window. Each mark carries a screen-reader date.

### Seasonal Edition Mechanism
- **Activation:** `getSeasonalEdition(now, override)` in `src/utils/seasonalEdition.ts`. The window is checked in UTC with inclusive month/day bounds, so it repeats every year without a deploy. `?edition=<name>` previews, `?edition=off` suppresses.
- **Wiring:** the layout writes `data-theme="<edition theme>"` and `data-edition="<name>"` on `<html>`, and preloads the edition display font only when active. Pages branch on the same function to swap their hero.
- **Theme:** each edition is a custom DaisyUI theme (`@plugin "daisyui/theme"`) in `global.css`, mapped onto the standard roles and keeping the `night` radius, size, border, depth and noise values.
- **Scoped overrides:** everything else (browser surfaces, gradient neutralization, footer atmosphere) sits under `html[data-edition='<name>']`.
- **Opt-out:** the navbar's dracula toggle still overrides the edition theme, because DaisyUI's `theme-controller` rule wins over `data-theme`.
- **A future edition** (for example a winter one; the repo already has the `SHOW_SNOW_EFFECT` flag and `AnimationFrameSnow.svelte`) plugs in the same way: add its name to `SeasonalEdition`, a window constant and a branch in `getSeasonalEdition`; add a DaisyUI theme with the same role names; scope its browser surfaces and atmosphere under `html[data-edition='winter']`; render its hero from the same page branch. The snow effect should then key off the edition rather than a standalone flag, and still honor reduced motion.

## Do's and Don'ts

### Do:
- **Do** scope every edition rule under `html[data-edition='<name>']` or inside an edition-only component, so the everyday site is byte-for-byte unaffected outside the window.
- **Do** build each edition as a DaisyUI theme on the standard roles, keeping the 0.5rem field, 1rem box and 1rem selector radii.
- **Do** re-tint the browser surfaces with the edition: `::selection`, `caret-color`, `accent-color`, `scrollbar-color` and the `:focus-visible` outline.
- **Do** keep only ectoplasm green and rank gold emitting under the Halloween edition (The Light Discipline Rule).
- **Do** make atmosphere from authored, tileable procedural textures used as masks and tinted by color, with a provenance sidecar next to each raster.
- **Do** stop all edition motion under `prefers-reduced-motion: reduce`, and move large layers by transform only.
- **Do** reserve gold, silver and bronze for ranking positions 1 to 3.
- **Do** use tabular numerals for counters, dates and ranks.

### Don't:
- **Don't** use seasonal clip art (pumpkins, bats, cartoon ghosts, stock snowflakes as images); editions are made from ground, light, fog and one original mark.
- **Don't** let fog or any atmospheric layer cover the ladder, live rooms, stats or any readable text.
- **Don't** add new gradient-text headings in either world; under an edition, headings are solid ink.
- **Don't** introduce a second emitted color in the Halloween edition, or use green for anything that is not the primary action or "tonight".
- **Don't** change layout, data density or component structure for an edition; an edition repaints, it never re-arranges the data.
- **Don't** remove the dracula toggle's ability to override the edition theme.
- **Don't** load an edition's display font outside its window.
