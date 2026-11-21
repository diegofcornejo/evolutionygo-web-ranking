/**
 * Geometry for the Christmas hero: a string of lights across the top and a
 * snowy hillside with pines on the horizon. Plain SVG built at render time,
 * so the edition ships no images of its own.
 */

export const LIGHTS_VIEWBOX = '0 0 1440 100';
export const HILLS_VIEWBOX = '0 0 1440 420';

/** Same single sag as the Día de Muertos garland. */
export const WIRE_PATH = 'M0 14Q720 66 1440 14';

const wireY = (x: number) => {
	const t = x / 1440;
	return 14 + 52 * t * (1 - t);
};

const BULB_COLORS = ['red', 'gold', 'green', 'blue'] as const;
export type BulbColor = (typeof BULB_COLORS)[number];

export type Bulb = { x: number; y: number; color: BulbColor; group: 0 | 1 };

/** Bulbs every 56 units, leaving the middle free for the snowflake that hangs there. */
export const BULBS: Bulb[] = Array.from({ length: 24 }, (_, i) => {
	const side = i < 12 ? -1 : 1;
	const step = i < 12 ? 11 - i : i - 12;
	const x = 720 + side * (58 + step * 56);
	return {
		x,
		y: +wireY(x).toFixed(1),
		color: BULB_COLORS[i % BULB_COLORS.length],
		group: (i % 2) as 0 | 1,
	};
});

export const HILLS_BASE = 392;

/** The hills run well past both edges, so wide screens never see where they end. */
export const BACK_HILL =
	'M-900 330H0C160 300 300 318 420 336C520 350 600 352 720 350C840 348 920 346 1020 334C1150 318 1290 296 1440 322H2340V420H-900Z';
export const FRONT_HILL =
	'M-900 362H0C120 346 240 344 360 360C460 372 560 380 720 380C880 380 980 372 1080 360C1200 346 1320 344 1440 358H2340V420H-900Z';

export type Pine = { x: number; base: number; height: number };

/** Two stands of pines flank the title and leave the middle of the valley open. */
export const PINES: Pine[] = [
	{ x: 120, base: 352, height: 120 },
	{ x: 176, base: 356, height: 168 },
	{ x: 236, base: 358, height: 104 },
	{ x: 300, base: 364, height: 140 },
	{ x: 372, base: 368, height: 92 },
	{ x: 1068, base: 366, height: 96 },
	{ x: 1136, base: 362, height: 144 },
	{ x: 1200, base: 358, height: 108 },
	{ x: 1262, base: 354, height: 172 },
	{ x: 1320, base: 352, height: 116 },
];

/** Three stacked tiers and a short trunk, as one path. */
export function pinePath({ x, base, height }: Pine): string {
	const trunk = height * 0.1;
	const top = base - height;
	const tiers = [
		{ apex: top, foot: top + height * 0.42, half: height * 0.2 },
		{ apex: top + height * 0.22, foot: top + height * 0.68, half: height * 0.28 },
		{ apex: top + height * 0.44, foot: base - trunk, half: height * 0.36 },
	];
	const shapes = tiers.map(
		({ apex, foot, half }) => `M${x} ${apex.toFixed(1)}L${(x + half).toFixed(1)} ${foot.toFixed(1)}H${(x - half).toFixed(1)}Z`
	);
	const trunkHalf = Math.max(3, height * 0.04);
	shapes.push(`M${(x - trunkHalf).toFixed(1)} ${(base - trunk).toFixed(1)}h${(trunkHalf * 2).toFixed(1)}V${base}h${(-trunkHalf * 2).toFixed(1)}Z`);
	return shapes.join('');
}

/** Snow resting on the lower edge of each tier. */
export function pineSnowPath({ x, base, height }: Pine): string {
	const top = base - height;
	return [
		{ foot: top + height * 0.42, half: height * 0.2 },
		{ foot: top + height * 0.68, half: height * 0.28 },
		{ foot: base - height * 0.1, half: height * 0.36 },
	]
		.map(({ foot, half }) => `M${(x - half * 0.9).toFixed(1)} ${(foot - 1).toFixed(1)}Q${x} ${(foot - 7).toFixed(1)} ${(x + half * 0.9).toFixed(1)} ${(foot - 1).toFixed(1)}`)
		.join('');
}

export type Flake = { left: number; size: number; duration: number; delay: number; drift: number };

/** Enough flakes to read as snowfall, few enough to stay light. */
export const FLAKES: Flake[] = [
	[3, 4, 13, -2, 18], [8, 3, 16, -9, -14], [13, 5, 12, -5, 22], [19, 3, 15, -12, -10],
	[24, 4, 14, -3, 16], [30, 6, 11, -7, -20], [36, 3, 17, -14, 12], [41, 4, 13, -1, -16],
	[47, 5, 12, -10, 20], [53, 3, 16, -6, -12], [58, 4, 14, -13, 14], [64, 6, 11, -4, -22],
	[69, 3, 15, -8, 10], [75, 5, 13, -11, -18], [80, 4, 14, -2, 16], [86, 3, 16, -9, -12],
	[91, 5, 12, -6, 18], [96, 4, 15, -12, -14],
].map(([left, size, duration, delay, drift]) => ({ left, size, duration, delay, drift }));
