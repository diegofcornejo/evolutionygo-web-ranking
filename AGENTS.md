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

`@components/*`, `@sections/*`, `@stores/*`, `@layouts/*`, `@pages/*`, `@types/*` → `./src/<folder>/*`
`@types` → `./src/types/types.d.ts`

## Code Style Guidelines

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

### TypeScript

- **Strict mode** via `astro/tsconfigs/strict`
- Use `type` keyword for type-only imports: `import type { Session } from '@types'`
- Define types in `src/types/*.d.ts` and export via `types.d.ts`
- Use `Readonly<Props>` for component props

### Component Conventions

| Extension  | Framework | When to Use                            |
| ---------- | --------- | -------------------------------------- |
| `.astro`   | Astro     | Pages, layouts, static content         |
| `.tsx`     | React     | Interactive components, forms          |
| `.svelte`  | Svelte    | Animations, real-time updates          |

### React Components

```tsx
interface Props { userId: string; size?: 'sm' | 'md' | 'lg'; }

export function Component({ userId, size = 'md' }: Readonly<Props>) {
  const [value, setValue] = useState('');
  return <div className="card">{/* JSX */}</div>;
}
```

### Svelte Components

```svelte
<script lang="ts">
  import type { Room } from 'src/types/Room';
  export let room: Room;
  $: filtered = room.players.filter((p) => p.team === 0);
</script>
<div class="card">{/* Template */}</div>
```

### Error Handling

```tsx
try {
  const response = await fetch(url);
  if (!response.ok) setError(data.message || 'Error in request');
} catch (error) {
  console.error('Error:', error);
  setError('No connection to server');
}
```

- Display errors via `toast` from `sonner` or component state

### Styling

- Use Tailwind CSS classes in `className` (React) or `class` (Svelte/Astro)
- DaisyUI components: `btn`, `card`, `input`, `modal`, `table`, etc.

## Testing

Location: `tests/` (mirrors `src/`). Naming: `*.test.ts` or `*.test.tsx`

```tsx
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@stores/sessionStore', () => ({ updateSession: vi.fn() }));

describe('Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Component {...props} />);
    expect(getByText('Expected')).toBeTruthy();
  });
});
```

## Git Hooks (Husky)

- **pre-commit:** `bunx lint-staged && bun run test:changed`
- **commit-msg:** Validates conventional commit format
- **pre-push:** Runs `bun run build`

### Commit Format

`<type>: <description>` — Types: `feat`, `fix`, `docs`, `chore`, `perf`, `refactor`, `style`, `test`

## State Management

Stores in `src/stores/` use Nanostores:
- React: `const sessionData = useStore(session);`
- Svelte: `{$roomsStore.length}`

## Important Notes

1. **React 19** - Use new React 19 APIs when applicable
2. **Tailwind 4** - Updated syntax; check docs for changes
3. **SSR Mode** - App runs server-side, not static
4. **Icons** - Use `astro-icon` with `@iconify-json/ic` and `@iconify-json/mdi`
5. **API URL** - Use `import.meta.env.PUBLIC_API_URL` for API calls
