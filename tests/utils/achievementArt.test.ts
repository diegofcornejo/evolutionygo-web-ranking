import { describe, it, expect } from 'vitest';
import { achievementArt } from '@utils/achievementArt';

describe('achievementArt', () => {
	it('finds the art of a catalog code', () => {
		expect(achievementArt('first_win')).toEqual({
			src: '/achievements/first_win-64.webp',
			srcSet: '/achievements/first_win-64.webp 1x, /achievements/first_win-128.webp 2x',
		});
	});

	it('maps format codes to their folder name', () => {
		expect(achievementArt('format_first_win:TCG')?.src).toBe('/achievements/format_first_win_tcg-64.webp');
		expect(achievementArt('format_first_win:Genesys')?.src).toBe('/achievements/format_first_win_genesys-64.webp');
	});

	it('covers every achievement that has approved art', () => {
		const codes = ['first_win', 'wins_10', 'wins_50', 'wins_100', 'streak_3', 'streak_5', 'streak_10', 'matches_100',
			'format_first_win:TCG', 'format_first_win:OCG', 'format_first_win:Edison', 'format_first_win:JTP', 'format_first_win:Genesys'];
		for (const code of codes) expect(achievementArt(code)).not.toBeNull();
	});

	it('returns null for achievements without art, so the emoji stays', () => {
		expect(achievementArt('LIGHTNING_FIRST')).toBeNull();
		expect(achievementArt('format_first_win:Worlds')).toBeNull();
		expect(achievementArt(null)).toBeNull();
		expect(achievementArt('')).toBeNull();
	});
});

describe('achievement art files', () => {
	it('ship every size the mapping points to', async () => {
		const { existsSync } = await import('node:fs');
		const codes = ['first_win', 'wins_10', 'wins_50', 'wins_100', 'streak_3', 'streak_5', 'streak_10', 'matches_100',
			'format_first_win:TCG', 'format_first_win:OCG', 'format_first_win:Edison', 'format_first_win:JTP', 'format_first_win:Genesys'];
		for (const code of codes) {
			const art = achievementArt(code);
			for (const file of art!.srcSet.split(', ').map((entry) => entry.split(' ')[0])) {
				expect(existsSync(`public${file}`), file).toBe(true);
			}
		}
	});
});
