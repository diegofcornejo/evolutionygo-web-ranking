import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { OG_HEIGHT, OG_WIDTH } from './ogImage';

// Build-only: imported by the prerendered /og endpoint, never by SSR code.

const fromRoot = (...parts: string[]) => join(process.cwd(), ...parts);
const fontFile = (weight: 700 | 800) =>
	fromRoot('node_modules/@fontsource/plus-jakarta-sans/files', `plus-jakarta-sans-latin-${weight}-normal.woff`);

const toDataUri = (png: Buffer) => `data:image/png;base64,${png.toString('base64')}`;

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
	type,
	props: { style, children, ...extra },
});

export async function renderSeasonCard(season: string): Promise<Buffer> {
	const [bold, extraBold, background, logo] = await Promise.all([
		readFile(fontFile(700)),
		readFile(fontFile(800)),
		sharp(fromRoot('public/profile/banner-1920.webp')).resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover' }).png().toBuffer(),
		sharp(fromRoot('public/logo.svg')).resize({ width: 420 }).png().toBuffer({ resolveWithObject: true }),
	]);

	const card = el(
		'div',
		{ display: 'flex', position: 'relative', width: OG_WIDTH, height: OG_HEIGHT, fontFamily: 'Plus Jakarta Sans', color: 'white' },
		[
			el('img', { position: 'absolute', top: 0, left: 0, width: OG_WIDTH, height: OG_HEIGHT }, undefined, {
				src: toDataUri(background),
				width: OG_WIDTH,
				height: OG_HEIGHT,
			}),
			el('div', {
				position: 'absolute',
				top: 0,
				left: 0,
				width: OG_WIDTH,
				height: OG_HEIGHT,
				backgroundImage: 'linear-gradient(90deg, rgba(8,4,20,0.92) 0%, rgba(8,4,20,0.7) 55%, rgba(8,4,20,0.2) 100%)',
			}),
			el(
				'div',
				{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 80, left: 80, right: 80, bottom: 70 },
				[
					el('img', { width: logo.info.width, height: logo.info.height }, undefined, {
						src: toDataUri(logo.data),
						width: logo.info.width,
						height: logo.info.height,
					}),
					el('div', { marginTop: 56, fontSize: 104, fontWeight: 800, letterSpacing: 4, lineHeight: 1 }, `SEASON ${season}`),
					el('div', { marginTop: 24, fontSize: 44, fontWeight: 700 }, 'YGO duels in your browser'),
					el('div', { marginTop: 14, fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.72)' }, 'EvoDuel · EDOPro · Koishi · YGO Mobile'),
					el('div', { marginTop: 'auto', alignSelf: 'flex-end', fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }, 'evolutionygo.com'),
				],
			),
		],
	);

	const svg = await satori(card as never, {
		width: OG_WIDTH,
		height: OG_HEIGHT,
		fonts: [
			{ name: 'Plus Jakarta Sans', data: bold, weight: 700, style: 'normal' },
			{ name: 'Plus Jakarta Sans', data: extraBold, weight: 800, style: 'normal' },
		],
	});

	return sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer();
}
