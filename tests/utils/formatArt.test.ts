import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { formatArt } from '@utils/formatArt';

describe('formatArt', () => {
	it('finds the format of a group or a dated ban list', () => {
		expect(formatArt('TCG')).toEqual({
			format: 'tcg',
			src: '/formats/tcg-64.webp',
			srcSet: '/formats/tcg-64.webp 1x, /formats/tcg-128.webp 2x',
		});
		expect(formatArt('2026.10 OCG')?.format).toBe('ocg');
		expect(formatArt('2010.03 Edison')?.format).toBe('edison');
		expect(formatArt('Genesys')?.format).toBe('genesys');
		expect(formatArt('JTP')?.format).toBe('jtp');
	});

	it('has no icon for ladders that are not one of the five formats', () => {
		for (const name of ['Global', 'GOAT', '2005.04 GOAT', '2026.05 Traditional', '2026.03 MD', 'HAT', 'N/A', '']) {
			expect(formatArt(name), name).toBeNull();
		}
	});

	it('does not match a format inside another word', () => {
		expect(formatArt('TCGX')).toBeNull();
	});

	it('ships every file it points to', () => {
		for (const format of ['tcg', 'ocg', 'edison', 'genesys', 'jtp']) {
			for (const size of [64, 128]) expect(existsSync(`public/formats/${format}-${size}.webp`), `${format}-${size}`).toBe(true);
		}
	});
});
