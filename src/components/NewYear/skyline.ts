/**
 * City skyline for the New Year hero, built once at render time from a seeded
 * generator so it is the same on every visit. Each layer is a single path and
 * all lit windows share one more, so the whole city is a handful of elements.
 */

export const SKYLINE_VIEWBOX = '0 0 1440 420';
export const SKYLINE_BASE = 410;

/** The city runs well past both edges, so wide screens never see where it ends. */
const FROM = -900;
const TO = 2340;

function seeded(seed: number) {
	let state = seed;
	return () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};
}

/** Taller toward the sides, lower behind the title so it stays readable. */
function heightAt(x: number, random: () => number, scale: number): number {
	const fromCenter = Math.min(1, Math.abs(x - 720) / 620);
	const profile = 0.35 + 0.65 * fromCenter ** 1.4;
	return (60 + random() * 150) * profile * scale + 30;
}

type Building = { x: number; width: number; height: number };

function buildings(seed: number, scale: number, minWidth: number, maxWidth: number): Building[] {
	const random = seeded(seed);
	const list: Building[] = [];
	for (let x = FROM; x < TO; ) {
		const width = Math.round(minWidth + random() * (maxWidth - minWidth));
		list.push({ x, width, height: Math.round(heightAt(x + width / 2, random, scale)) });
		x += width + Math.round(random() * 4);
	}
	return list;
}

function outline(list: Building[]): string {
	return list
		.map(({ x, width, height }, index) => {
			const top = SKYLINE_BASE - height;
			// A few of the taller towers carry an antenna.
			const antenna = height > 190 && index % 3 === 0 ? `M${x + width / 2 - 1} ${top}v-26h2v26Z` : '';
			return `M${x} ${SKYLINE_BASE}V${top}h${width}V${SKYLINE_BASE}Z${antenna}`;
		})
		.join('');
}

const FAR = buildings(7, 1.25, 36, 80);
const NEAR = buildings(31, 0.9, 44, 96);

export const FAR_SKYLINE = outline(FAR);
export const NEAR_SKYLINE = outline(NEAR);

/** Lit windows on the near layer, split into steady ones and a few that come and go. */
export const { WINDOWS, TWINKLING_WINDOWS } = (() => {
	const random = seeded(97);
	let steady = '';
	let twinkling = '';
	for (const { x, width, height } of NEAR) {
		const top = SKYLINE_BASE - height;
		const columns = Math.max(1, Math.floor((width - 10) / 12));
		const offset = x + (width - columns * 12 + 6) / 2;
		for (let y = top + 10; y < SKYLINE_BASE - 24; y += 16) {
			for (let column = 0; column < columns; column++) {
				const roll = random();
				if (roll > 0.22) continue;
				const rect = `M${(offset + column * 12).toFixed(1)} ${y}h5v7h-5Z`;
				if (roll < 0.03) twinkling += rect;
				else steady += rect;
			}
		}
	}
	return { WINDOWS: steady, TWINKLING_WINDOWS: twinkling };
})();

export const SKYLINE_EXTENT = { x: FROM, width: TO - FROM };
