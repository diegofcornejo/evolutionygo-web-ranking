# AGENTS

Context guide for AI agents working on this repository.

## Project Overview

**Evolution YGO Web Ranking** - Web application for Yu-Gi-Oh! duelist rankings and statistics on the Evolution YGO server. Features authentication, seasonal rankings, player stats, achievements, and real-time duel visualization.

**Production:** https://evolutionygo.com

## Tech Stack

| Category     | Technology                              |
| ------------ | --------------------------------------- |
| Framework    | Astro 5.x (SSR with Vercel adapter)     |
| UI           | React 19, Svelte 5                      |
| Styling      | Tailwind CSS 4, DaisyUI 5               |
| State        | Nanostores with persistence             |
| Testing      | Vitest + Testing Library                |
| Linting      | OxLint                                  |
| Package Mgr  | Bun                                     |

## Commands

| Command                     | Description                              |
| --------------------------- | ---------------------------------------- |
| `bun install`               | Install dependencies                     |
| `bun run dev`               | Development server at localhost:4321     |
| `bun run build`             | Production build (includes type check)   |
| `bun run test`              | Run all tests                            |
| `bun run test -- <pattern>` | Run single test by filename pattern      |
| `bun run test:watch`        | Tests in watch mode                      |
| `bun run test:coverage`     | Tests with coverage report               |
| `bun run test:changed`      | Run tests on changed files only          |
| `bun run lint`              | Run OxLint                               |
| `bun run lint:fix`          | Run OxLint with auto-fix                 |

### Running a Single Test

```bash
bun run test -- DuelistCard                                    # By filename
bun run test -- tests/components/Cards/DuelistCard.test.tsx    # By full path
bun run test -- "sessionStore|roomsStore"                      # Multiple patterns
```

## Project Structure

```
src/
├── components/       # Reusable UI components (.tsx, .svelte, .astro)
├── layouts/          # Astro layouts (Layout.astro)
├── pages/            # File-based routing
├── sections/         # Page sections (Ranking.tsx, Live.svelte)
├── stores/           # Nanostores state management
├── styles/           # Global CSS
└── types/            # TypeScript type definitions (.d.ts)
tests/                # Unit tests (mirrors src/ structure)
```

## Path Aliases

`@components/*`, `@sections/*`, `@stores/*`, `@layouts/*`, `@pages/*`, `@types/*` -> `./src/<folder>/*`
`@types` -> `./src/types/types.d.ts`

## Code Style Guidelines

### Formatting

- TypeScript strict mode via `astro/tsconfigs/strict`.
- Prefer single quotes in TS/JS; keep JSX attributes double quoted.
- Keep props typed with `Readonly<Props>` in React components.
- Avoid unnecessary comments; add only for non-obvious logic.

### Import Order

1. React/framework imports (`import { useState } from 'react'`)
2. Third-party libraries (`import { toast } from 'sonner'`)
3. Type imports (`import type { Session } from '@types'`)
4. Local stores (`import { updateSession } from '@stores/sessionStore'`)
5. Local components (`import { AuthEmailField } from './FormFields'`)

### Naming Conventions

| Element      | Convention        | Example                           |
| ------------ | ----------------- | --------------------------------- |
| Components   | PascalCase        | `DuelistCard`, `SignInForm`       |
| Files        | PascalCase        | `DuelistCard.tsx`, `Live.svelte`  |
| Stores       | camelCase         | `sessionStore.ts`, `roomsStore.ts`|
| Types        | PascalCase        | `Duelist`, `Session`, `Room`      |
| Functions    | camelCase         | `getSession`, `updateRoom`        |

### Component Frameworks

| Extension  | Framework | When to Use                            |
| ---------- | --------- | -------------------------------------- |
| `.astro`   | Astro     | Pages, layouts, static content         |
| `.tsx`     | React     | Interactive components, forms          |
| `.svelte`  | Svelte    | Animations, real-time updates          |

### React Component Example

```tsx
import type { Duelist } from '@types';
import Rating from '@components/Rating';

interface Props extends Duelist {
  banListName: string;
  season: string;
  clickable?: boolean;
}

export default function DuelistCard({
  userId,
  username,
  points,
  wins,
  losses,
  winRate,
  position,
  borderColor = 'transparent',
  banListName,
  season,
  clickable = true,
}: Readonly<Props>) {
  const image = `https://ui-avatars.com/api/?name=${username}&background=random&size=128`;
  return (
    <a href={clickable ? `/duelists/${userId}/${banListName}?username=${username}&season=${season}` : undefined}
      className="card bg-base-300 w-full shadow-xl cursor-pointer max-w-sm hover:bg-neutral transition-all duration-200 ease-in-out border-2 border-${borderColor}">
      {/* JSX content */}
    </a>
  );
}
```

### Svelte Component Example

```svelte
<script>
  import { onMount } from 'svelte'
  export let room;
  $: filtered = room.players.filter((p) => p.team === 0);
</script>
<div class="card">{/* Template */}</div>
```

### Astro Page Example

```astro
---
import Layout from '@layouts/Layout.astro';
import Ranking from '@sections/Ranking';
import Live from '@sections/Live.svelte';
---

<Layout title="Page Title" description="Page description">
  <main class="w-full text-[white]">
    <Ranking client:load />
    <Live client:only="svelte" />
  </main>
</Layout>
```

### Error Handling

```tsx
try {
  const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/endpoint`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    setError(data.message || 'Error in request');
    return;
  }
  // Handle success
} catch (error) {
  console.error('Error:', error);
  setError('No connection to server');
}
```

- Display errors via `toast` from `sonner` or component state.

### Styling

- Use Tailwind CSS classes in `className` (React) or `class` (Svelte/Astro).
- Prefer DaisyUI primitives: `btn`, `card`, `input`, `modal`, `table`.

## Testing

- Tests live in `tests/` and mirror `src/` structure.
- Naming: `*.test.ts` or `*.test.tsx`.
- Vitest globals enabled; use `describe`, `it`, `expect`, `vi` from `vitest`.
- Use `@testing-library/react` for React component testing.

```tsx
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SignInForm } from '@components/Auth/SignInForm';

vi.mock('@stores/sessionStore', () => ({ updateSession: vi.fn() }));

describe('SignInForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve(mockResponse({})));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders email and password fields', () => {
    render(<SignInForm dialog="test-dialog" />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });
});
```

## Git Hooks (Husky)

- pre-commit: `bunx lint-staged && bun run test:changed`
- commit-msg: validates conventional commit format
- pre-push: `bun run build`

### Commit Format

`<type>: <description>` - Types: `feat`, `fix`, `docs`, `chore`, `perf`, `refactor`, `style`, `test`

## State Management

Stores in `src/stores/` use Nanostores:

```tsx
import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

export const session = persistentAtom<string>('session', '', {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const banlists = atom<string[]>([]);
```

- React: `const sessionData = useStore(session);`
- Svelte: `{$roomsStore.length}`

## Environment Notes

- Use `import.meta.env.PUBLIC_API_URL` for API calls.
- Use `import.meta.env.PUBLIC_WEBSOCKET_URL` for WebSocket connections.
- SSR mode (`output: 'server'`); avoid browser-only code in Astro frontmatter.
- Icons via `astro-icon` with `@iconify-json/ic` and `@iconify-json/mdi`.
- Client directives: `client:load` for interactivity, `client:only="react"` or `client:only="svelte"` for client-only components.
