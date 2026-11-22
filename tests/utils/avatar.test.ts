import { describe, it, expect } from 'vitest';
import {
	AVATAR_OPTIONS,
	AVATAR_THEMES,
	DEFAULT_AVATAR,
	applyTheme,
	avatarDataUri,
	randomAvatar,
	renderAvatarSvg,
	sanitizeAvatar,
} from '@utils/avatar';

const hex = (group: keyof typeof AVATAR_OPTIONS, id: string) => {
	const option = (AVATAR_OPTIONS[group] as readonly { id: string; hex?: string }[]).find((o) => o.id === id);
	return option?.hex ?? '';
};

describe('sanitizeAvatar', () => {
	it('returns the default look for anything that is not an object', () => {
		expect(sanitizeAvatar(null)).toEqual(DEFAULT_AVATAR);
		expect(sanitizeAvatar('spiky')).toEqual(DEFAULT_AVATAR);
		expect(sanitizeAvatar([1, 2])).toEqual(DEFAULT_AVATAR);
	});

	it('keeps valid choices and replaces only the unknown ones', () => {
		const result = sanitizeAvatar({ ...DEFAULT_AVATAR, hairStyle: 'spiky', eyeColor: 'not-a-color', extra: 1 });
		expect(result).toEqual({ ...DEFAULT_AVATAR, hairStyle: 'spiky' });
		expect(result).not.toHaveProperty('extra');
	});

	it('fills missing fields with the default', () => {
		expect(sanitizeAvatar({ shirtColor: 'red' })).toEqual({ ...DEFAULT_AVATAR, shirtColor: 'red' });
	});

	it('keeps an avatar saved before the fantasy pieces in a t-shirt with no magic', () => {
		const before: Record<string, string> = { ...DEFAULT_AVATAR, shirtColor: 'red', headwear: 'cap' };
		for (const key of ['outfit', 'magic', 'magicColor']) delete before[key];
		const result = sanitizeAvatar(before);
		expect(result).toMatchObject({ outfit: 'tshirt', magic: 'none', shirtColor: 'red', headwear: 'cap' });
	});
});

describe('applyTheme', () => {
	it('dresses the look in every piece of the theme and keeps the face and hair', () => {
		const look = { ...DEFAULT_AVATAR, hairStyle: 'curly' as const, skinTone: 'deep' as const };
		const knight = applyTheme(look, 'knight');
		expect(knight).toMatchObject({ outfit: 'knight', headwear: 'helmet', background: 'castle', hairStyle: 'curly', skinTone: 'deep' });
	});

	it('only uses options that exist', () => {
		for (const theme of Object.keys(AVATAR_THEMES) as (keyof typeof AVATAR_THEMES)[]) {
			const look = applyTheme(DEFAULT_AVATAR, theme);
			expect(sanitizeAvatar(look)).toEqual(look);
			expect(look).toMatchObject(AVATAR_THEMES[theme].look);
		}
	});
});

describe('randomAvatar', () => {
	it('always returns a valid look', () => {
		let seed = 0;
		const rng = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
		for (let i = 0; i < 50; i++) {
			const avatar = randomAvatar(rng);
			expect(sanitizeAvatar(avatar)).toEqual(avatar);
		}
	});
});

describe('renderAvatarSvg', () => {
	it('renders a standalone svg', () => {
		const svg = renderAvatarSvg(DEFAULT_AVATAR);
		expect(svg.startsWith('<svg')).toBe(true);
		expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
		expect(svg.trim().endsWith('</svg>')).toBe(true);
	});

	it('paints the chosen hair, eye, shirt and background colours', () => {
		const svg = renderAvatarSvg({
			...DEFAULT_AVATAR,
			hairStyle: 'short',
			hairColor: 'blue',
			eyeStyle: 'round',
			eyeColor: 'green',
			shirtColor: 'red',
			background: 'gold',
		});
		expect(svg).toContain(hex('hairColor', 'blue'));
		expect(svg).toContain(hex('eyeColor', 'green'));
		expect(svg).toContain(hex('shirtColor', 'red'));
		expect(svg).toContain(hex('background', 'gold'));
	});

	it('paints the head, ears and neck with the chosen skin tone', () => {
		const svg = renderAvatarSvg({ ...DEFAULT_AVATAR, skinTone: 'deep' });
		const head = svg.match(/<g data-layer="head">.*?<\/g>/s)?.[0] ?? '';
		expect(head.split(hex('skinTone', 'deep')).length - 1).toBe(4);
		expect(svg).not.toContain(hex('skinTone', 'light'));
	});

	it('covers sleepy eyelids with the same skin tone as the face', () => {
		const svg = renderAvatarSvg({ ...DEFAULT_AVATAR, skinTone: 'tan', eyeStyle: 'sleepy' });
		const eyes = svg.match(/<g data-layer="eyes-sleepy">.*?<\/g>/s)?.[0] ?? '';
		expect(eyes).toContain(hex('skinTone', 'tan'));
	});

	it('marks each layer so every choice is visible', () => {
		const svg = renderAvatarSvg({
			...DEFAULT_AVATAR,
			hairStyle: 'long',
			eyewear: 'round',
			headwear: 'beanie',
			shirtLogo: 'star',
		});
		expect(svg).toContain('data-layer="hair-long"');
		expect(svg).toContain('data-layer="eyewear-round"');
		expect(svg).toContain('data-layer="headwear-beanie"');
		expect(svg).toContain('data-layer="logo-star"');
	});

	it('puts the Evolution emblem on the shirt in a colour that reads on it', () => {
		const light = renderAvatarSvg({ ...DEFAULT_AVATAR, shirtColor: 'white', shirtLogo: 'evolution' });
		const dark = renderAvatarSvg({ ...DEFAULT_AVATAR, shirtColor: 'black', shirtLogo: 'evolution' });
		expect(light).toMatch(/data-layer="logo-evolution".*?<g fill="#23262d"/s);
		expect(dark).toMatch(/data-layer="logo-evolution".*?<g fill="#ffffff"/s);
	});

	it('sits the logo on the chest, below the collar', () => {
		const svg = renderAvatarSvg({ ...DEFAULT_AVATAR, shirtLogo: 'star' });
		const [, offset, scale] = svg.match(/data-layer="logo-star" transform="translate\(64 ([\d.]+)\) scale\(([\d.]+)\)/) ?? [];
		const top = Number(offset) - 10 * Number(scale);
		expect(top).toBeGreaterThan(105);
	});

	it('leaves out the layers that are set to none', () => {
		const svg = renderAvatarSvg({ ...DEFAULT_AVATAR, hairStyle: 'bald', eyewear: 'none', headwear: 'none', shirtLogo: 'none' });
		expect(svg).not.toMatch(/data-layer="hair-/);
		expect(svg).not.toMatch(/data-layer="eyewear-/);
		expect(svg).not.toMatch(/data-layer="headwear-/);
		expect(svg).not.toMatch(/data-layer="logo-/);
	});

	it('draws the same face for every look', () => {
		const a = renderAvatarSvg({ ...DEFAULT_AVATAR, hairStyle: 'spiky', eyeStyle: 'happy' });
		const b = renderAvatarSvg({ ...DEFAULT_AVATAR, hairStyle: 'curly', eyeStyle: 'sharp' });
		const face = (svg: string) => svg.match(/<g data-layer="face">.*?<\/g>/s)?.[0];
		expect(face(a)).toBeTruthy();
		expect(face(a)).toBe(face(b));
	});

	it('renders every option of every group without throwing', () => {
		for (const [group, options] of Object.entries(AVATAR_OPTIONS)) {
			for (const option of options) {
				expect(() => renderAvatarSvg({ ...DEFAULT_AVATAR, [group]: option.id })).not.toThrow();
			}
		}
	});

	it('sanitizes the look before drawing it', () => {
		const svg = renderAvatarSvg({ hairColor: '"/><script>alert(1)</script>' } as never);
		expect(svg).not.toContain('<script>');
	});

	it('keeps hair from poking through hats that cover the head', () => {
		expect(renderAvatarSvg({ ...DEFAULT_AVATAR, headwear: 'beanie' })).toContain('clip-path="url(#av-hat)"');
		expect(renderAvatarSvg({ ...DEFAULT_AVATAR, headwear: 'crown' })).not.toContain('clip-path');
	});

	it('dresses the bust in the chosen outfit', () => {
		expect(renderAvatarSvg(DEFAULT_AVATAR)).toContain('data-layer="outfit-tshirt"');
		const mage = renderAvatarSvg({ ...DEFAULT_AVATAR, outfit: 'mage', shirtColor: 'teal' });
		expect(mage).toContain('data-layer="outfit-mage"');
		expect(mage).toContain(hex('shirtColor', 'teal'));
	});

	it('shows the logo on t-shirts and knight tabards only', () => {
		const look = { ...DEFAULT_AVATAR, shirtLogo: 'star' as const };
		expect(renderAvatarSvg({ ...look, outfit: 'knight' })).toContain('data-layer="logo-star"');
		expect(renderAvatarSvg({ ...look, outfit: 'mage' })).not.toContain('data-layer="logo-');
		expect(renderAvatarSvg({ ...look, outfit: 'vampire' })).not.toContain('data-layer="logo-');
	});

	it('hangs a hood behind the head and hides long hair under it', () => {
		const svg = renderAvatarSvg({ ...DEFAULT_AVATAR, headwear: 'hood', hairStyle: 'long' });
		expect(svg).toContain('data-layer="headwear-hood-back"');
		expect(svg).not.toContain('data-layer="hair-long-back"');
		expect(svg.indexOf('headwear-hood-back')).toBeLessThan(svg.indexOf('data-layer="head"'));
	});

	it('paints a scene behind themed backgrounds and none behind plain colours', () => {
		expect(renderAvatarSvg({ ...DEFAULT_AVATAR, background: 'graveyard' })).toContain('data-layer="scene-graveyard"');
		expect(renderAvatarSvg({ ...DEFAULT_AVATAR, background: 'gold' })).not.toContain('data-layer="scene-');
	});

	it('draws magic as an aura, glowing eyes or both, in the chosen colour', () => {
		const look = { ...DEFAULT_AVATAR, magicColor: 'ember' as const };
		const aura = renderAvatarSvg({ ...look, magic: 'aura' });
		const eyes = renderAvatarSvg({ ...look, magic: 'eyes' });
		const both = renderAvatarSvg({ ...look, magic: 'both' });
		expect(aura).toContain('data-layer="aura"');
		expect(aura).not.toContain('data-layer="glow"');
		expect(eyes).toContain('data-layer="glow"');
		expect(eyes).not.toContain('data-layer="aura"');
		expect(both).toContain('data-layer="aura"');
		expect(both).toContain('data-layer="glow"');
		expect(aura).toContain(hex('magicColor', 'ember'));
		expect(renderAvatarSvg(look)).not.toContain(hex('magicColor', 'ember'));
	});
});

describe('avatarDataUri', () => {
	it('encodes the svg as a data uri usable as an img src', () => {
		const uri = avatarDataUri(DEFAULT_AVATAR);
		expect(uri.startsWith('data:image/svg+xml,')).toBe(true);
		expect(decodeURIComponent(uri.slice('data:image/svg+xml,'.length))).toBe(renderAvatarSvg(DEFAULT_AVATAR));
	});
});
