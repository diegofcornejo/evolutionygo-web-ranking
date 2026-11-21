/**
 * Geometry for the Día de Muertos hero: a papel picado garland across the top
 * and an ofrenda of candles and marigolds on the horizon. Everything is plain
 * SVG built at render time, so the edition ships no images of its own.
 */

export const GARLAND_VIEWBOX = '0 0 1440 100';
export const ALTAR_VIEWBOX = '0 0 1440 420';

const FLAG_WIDTH = 64;
const FLAG_HEIGHT = 74;
const TEETH = 6;
/** Flags are drawn at 64x74 and hung smaller, so the garland stays shallow. */
export const FLAG_SCALE = 0.82;

/** Rosa mexicano, cempasúchil, turquesa, morado, verde limón, naranja. */
const FLAG_COLORS = ['#e4007c', '#ff9f1c', '#1fb5a8', '#8a4fd8', '#9ccc3c', '#ff5a36'];

const circle = (cx: number, cy: number, r: number) =>
	`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;

const diamond = (cx: number, cy: number, r: number) =>
	`M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z`;

/** Paper outline with a zigzag hem; the holes are cut by `fill-rule: evenodd`. */
const outline = (() => {
	const body = FLAG_HEIGHT - 10;
	const tooth = FLAG_WIDTH / TEETH;
	let d = `M0 0H${FLAG_WIDTH}V${body}`;
	for (let i = 0; i < TEETH; i++) {
		d += `L${FLAG_WIDTH - (i + 0.5) * tooth} ${FLAG_HEIGHT}L${FLAG_WIDTH - (i + 1) * tooth} ${body}`;
	}
	return `${d}Z`;
})();

const cx = FLAG_WIDTH / 2;
const cy = 32;

/** Two cut patterns, alternated along the string: a flower and a diamond with a ring of dots. */
const MOTIFS = [
	[
		circle(cx, cy, 11),
		circle(cx, cy, 3.5),
		diamond(cx, 10, 4),
		diamond(cx, 54, 4),
		diamond(12, cy, 4),
		diamond(FLAG_WIDTH - 12, cy, 4),
		circle(8, 8, 2.5),
		circle(FLAG_WIDTH - 8, 8, 2.5),
		circle(8, 56, 2.5),
		circle(FLAG_WIDTH - 8, 56, 2.5),
	],
	[
		diamond(cx, cy, 13),
		diamond(cx, cy, 5),
		...Array.from({ length: 8 }, (_, i) => {
			const angle = (i / 8) * Math.PI * 2;
			return circle(+(cx + Math.cos(angle) * 21).toFixed(1), +(cy + Math.sin(angle) * 21).toFixed(1), 2.5);
		}),
	],
].map((holes) => [outline, ...holes].join(''));

/** Height of the string at `x`, on the same quadratic curve as `STRING_PATH`. */
const sag = (x: number) => {
	const t = x / 1440;
	return 14 + 52 * t * (1 - t);
};

export const STRING_PATH = `M0 14Q720 66 1440 14`;

export type Flag = { x: number; y: number; d: string; fill: string; delay: number };

/** Seven flags each side, with a gap in the middle where the calavera hangs. */
export const FLAGS: Flag[] = Array.from({ length: 14 }, (_, i) => {
	const side = i < 7 ? -1 : 1;
	const center = 720 + side * (75 + 100 * (i < 7 ? 6 - i : i - 7));
	return {
		x: +(center - (FLAG_WIDTH * FLAG_SCALE) / 2).toFixed(1),
		y: +(sag(center) - 2).toFixed(1),
		d: MOTIFS[i % MOTIFS.length],
		fill: FLAG_COLORS[i % FLAG_COLORS.length],
		delay: -((i * 0.73) % 4),
	};
});

export type Candle = {
	x: number;
	width: number;
	height: number;
	/** Seconds per flicker, varied so the flames never move together. */
	flicker: number;
	delay: number;
};

/** Two clusters flank the title and leave the middle of the altar open. */
export const CANDLES: Candle[] = [
	{ x: 150, width: 26, height: 96, flicker: 2.1, delay: -0.4 },
	{ x: 200, width: 34, height: 150, flicker: 2.7, delay: -1.3 },
	{ x: 258, width: 24, height: 72, flicker: 1.9, delay: -0.9 },
	{ x: 330, width: 30, height: 118, flicker: 2.4, delay: -1.8 },
	{ x: 1080, width: 30, height: 112, flicker: 2.3, delay: -0.2 },
	{ x: 1140, width: 24, height: 70, flicker: 2, delay: -1.5 },
	{ x: 1190, width: 34, height: 146, flicker: 2.8, delay: -0.7 },
	{ x: 1252, width: 26, height: 92, flicker: 2.2, delay: -1.1 },
];

export const ALTAR_BASE = 392;

export type Marigold = { cx: number; cy: number; r: number };

/** Cempasúchil heaped at the foot of the candles. */
export const MARIGOLDS: Marigold[] = [
	[118, 388, 14], [140, 380, 11], [178, 390, 13], [236, 384, 12], [292, 392, 15], [312, 378, 10],
	[364, 388, 13], [392, 394, 11], [1052, 390, 12], [1112, 382, 13], [1170, 392, 11], [1228, 384, 14],
	[1280, 390, 12], [1306, 378, 10], [1336, 392, 13],
].map(([cx, cy, r]) => ({ cx, cy, r }));

export type Petal = { left: number; size: number; duration: number; delay: number; drift: number };

/** A handful of falling petals: enough to read as cempasúchil, few enough to stay light. */
export const PETALS: Petal[] = [
	[6, 9, 11, -3, 30], [14, 7, 13, -8, -24], [23, 10, 12, -6, 18], [31, 8, 14, -11, -30],
	[44, 7, 12, -2, 26], [58, 9, 11, -9, -20], [67, 8, 13, -12, 22], [76, 10, 12, -5, -28],
	[85, 7, 14, -10, 20], [93, 9, 12, -7, -18],
].map(([left, size, duration, delay, drift]) => ({ left, size, duration, delay, drift }));
