# AGENTS

Context guide for AI agents working on this project.

## Project Description

**Evolution YGO Web Ranking** is a web application to display rankings and statistics for duelists on the Evolution YGO server (Yu-Gi-Oh!). It includes user authentication, rankings by season/banlist, player statistics, achievements, and real-time duel visualization.

**Production URL:** https://evolutionygo.com

## Tech Stack

- **Framework:** Astro 5.x (SSR with Vercel adapter)
- **UI Frameworks:** React 19, Svelte 5
- **Styling:** Tailwind CSS 4, DaisyUI 5
- **State Management:** Nanostores with persistence
- **Testing:** Vitest + Testing Library
- **Linting:** OxLint
- **Package Manager:** Bun

## Environment

- Package manager: **Bun**
- Use `bun run` for scripts (e.g., `bun run dev`, `bun run test`)
- Node environment with ES Modules (`"type": "module"`)

## Main Commands

| Command                 | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `bun install`           | Install dependencies                             |
| `bun run dev`           | Development server at `localhost:4321`           |
| `bun run build`         | Production build (includes `astro check`)        |
| `bun run preview`       | Preview local build                              |
| `bun run test`          | Run tests with Vitest                            |
| `bun run test:watch`    | Tests in watch mode                              |
| `bun run test:coverage` | Tests with coverage report                       |
| `bun run lint`          | Run OxLint                                       |
| `bun run lint:fix`      | Run OxLint with auto-fix                         |

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── Auth/         # Authentication forms (React)
│   ├── Cards/        # UI cards (React, Svelte, Astro)
│   ├── NavBar/       # Navigation (Astro)
│   ├── Settings/     # User settings (React)
│   └── Tournaments/  # Tournament components (React)
├── layouts/          # Astro layouts
├── pages/            # Application routes
│   ├── duelists/[id]/[banlist].astro  # Duelist profile
│   └── tournaments/  # Tournament pages
├── sections/         # Page sections (React, Svelte)
├── stores/           # Global state with Nanostores
├── styles/           # Global styles
└── types/            # TypeScript definitions
tests/                # Unit tests (mirrors src/ structure)
```

## Path Aliases (TypeScript)

```typescript
@components/*  → ./src/components/*
@sections/*    → ./src/sections/*
@stores/*      → ./src/stores/*
@layouts/*     → ./src/layouts/*
@pages/*       → ./src/pages/*
@types/*       → ./src/types/*
@types         → ./src/types/types.d.ts
```

## Component Conventions

The project uses **three UI frameworks**. Choose based on use case:

| Extension   | Framework | Recommended Use                                    |
| ----------- | --------- | -------------------------------------------------- |
| `.astro`    | Astro     | Pages, layouts, static components                  |
| `.tsx`      | React     | Interactive components, forms                      |
| `.svelte`   | Svelte    | Components with animations/real-time updates       |

### File examples by type:
- **Astro:** `Footer.astro`, `Navbar.astro`, `Modal.astro`
- **React:** `SignInForm.tsx`, `DuelistCard.tsx`, `Rating.tsx`
- **Svelte:** `MatchCard.svelte`, `Live.svelte`, `Stats.svelte`

## Testing

- **Framework:** Vitest with jsdom
- **Location:** `tests/` (mirrors `src/` structure)
- **Naming:** `*.test.ts` or `*.test.tsx`

```bash
# Run all tests
bun run test

# Run specific tests by pattern
bun run test -- <pattern>

# Tests in watch mode
bun run test:watch

# With coverage
bun run test:coverage
```

## Git Hooks (Husky)

- **pre-commit:** Runs lint-staged (OxLint on modified files)
- **commit-msg:** Validates commit format (Conventional Commits)
- **pre-push:** Additional validations

### Commit Format

Use [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add user profile page
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
refactor: simplify auth logic
test: add tests for DuelistCard
chore: update dependencies
```

## Global State (Nanostores)

Stores are located in `src/stores/`:

- `sessionStore.ts` - User session
- `themeStore.ts` - Application theme
- `banlistsStore.ts` - Ban lists
- `featureFlagsStore.ts` - Feature flags
- `rooms/` - Duel room state

### Usage in React:
```tsx
import { useStore } from '@nanostores/react';
import { $session } from '@stores/sessionStore';

const session = useStore($session);
```

## Deployment

- **Platform:** Vercel (SSR)
- **Configuration:** `vercel.json` and adapter in `astro.config.mjs`
- **Maintenance mode:** Configurable via `MAINTENANCE_ENABLED` env var

## Important Notes

1. **Strict TypeScript:** Project uses `astro/tsconfigs/strict`
2. **React 19:** Use new React 19 APIs
3. **Tailwind 4:** Updated Tailwind CSS v4 syntax
4. **SSR:** App runs in server mode, not static
5. **Icons:** Use `astro-icon` with `@iconify-json/ic` and `@iconify-json/mdi` collections


## Commit & Pull Request Guidelines

Follow conventional-commit style: `<type>[scope]: <description>`

**Types:** `feat`, `fix`, `docs`, `chore`, `perf`, `refactor`, `style`, `test`
**Description:** Clear and medium length description of the change.
