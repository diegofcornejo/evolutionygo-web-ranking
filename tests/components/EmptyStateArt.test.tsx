import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import EmptyStateArt from '@components/EmptyStateArt';

const NAMES = ['history', 'leaderboard', 'load-error', 'atlas'] as const;

describe('EmptyStateArt', () => {
	it('draws the illustration as decoration', () => {
		const img = render(<EmptyStateArt name="history" />).container.querySelector('img')!;
		expect(img).toHaveAttribute('src', '/empty-states/history-128.webp');
		expect(img).toHaveAttribute('srcset', '/empty-states/history-128.webp 1x, /empty-states/history-256.webp 2x');
		expect(img).toHaveAttribute('alt', '');
		expect(img).toHaveAttribute('data-empty-state', 'history');
	});

	it('ships every illustration it can draw', () => {
		for (const name of NAMES) {
			for (const size of [128, 256]) expect(existsSync(`public/empty-states/${name}-${size}.webp`), `${name}-${size}`).toBe(true);
		}
	});
});
