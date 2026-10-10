/**
 * "Duel in the dark" pulls the home into a Shadow Realm vortex before leaving
 * for the game. The page itself is twisted by an SVG displacement filter; the
 * vortex is painted on one viewport-sized canvas, so it never asks the GPU for
 * layers many times the size of the screen.
 */

export const VORTEX_MS = 7000;

/** Logarithmic spiral arms around the origin, out to a radius of 100. */
export function spiralArms(count = 6, growth = 0.3, start = 2): string[] {
	const end = Math.log(100 / start) / growth;
	return Array.from({ length: count }, (_, arm) => {
		const turn = (arm / count) * Math.PI * 2;
		const points: string[] = [];
		for (let theta = 0; theta <= end; theta += 0.05) {
			const r = start * Math.exp(growth * theta);
			points.push(`${(r * Math.cos(theta + turn)).toFixed(1)} ${(r * Math.sin(theta + turn)).toFixed(1)}`);
		}
		return `M${points.join('L')}`;
	});
}

/** Plain left clicks fall in; modified clicks open a tab as usual and reduced motion skips the show. */
export function shouldFall(event: MouseEvent, reducedMotion: boolean): boolean {
	return (
		!reducedMotion &&
		!event.defaultPrevented &&
		event.button === 0 &&
		!event.metaKey &&
		!event.ctrlKey &&
		!event.shiftKey &&
		!event.altKey
	);
}

/** Diameter of the hole at the eye of the swirl, in vmax, by progress; the last one covers any viewport. */
const HOLE: [progress: number, diameter: number][] = [
	[0, 0],
	[0.18, 0],
	[0.45, 8],
	[0.7, 24],
	[0.9, 150],
];
/** Progress by which the hole has covered the whole viewport. */
const COVERED = 0.92;

/** Linear between keyframes, except the last stretch, which speeds up (t²) as it swallows the screen. */
export function holeDiameter(progress: number): number {
	const next = HOLE.findIndex(([at]) => at >= progress);
	if (next === -1) return HOLE[HOLE.length - 1][1];
	if (next === 0) return HOLE[0][1];
	const [fromAt, from] = HOLE[next - 1];
	const [toAt, to] = HOLE[next];
	const t = (progress - fromAt) / (toAt - fromAt);
	return from + (to - from) * (next === HOLE.length - 1 ? t * t : t);
}

/** How far the page is drawn into the swirl at progress `t`: slow at first, then all at once. */
export function swirlStrength(t: number): number {
	return Math.min(1, Math.max(0, t / 0.88)) ** 1.8;
}

/**
 * Displacement map for an feDisplacementMap that twists the viewport around its
 * centre and drags it inwards. Red and green carry the offset (0.5 is none),
 * `scale` is the filter scale that turns them back into pixels. Points on and
 * beyond the ellipse inscribed in the viewport stay put, so nothing is sampled
 * from outside it.
 */
export function swirlMap(
	cols: number,
	rows: number,
	width: number,
	height: number,
	twist = 4,
	pull = 2
): { pixels: Uint8ClampedArray<ArrayBuffer>; scale: number } {
	const rx = width / 2;
	const ry = height / 2;
	const offsets = new Float32Array(cols * rows * 2);
	let largest = 0;
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const nx = ((col + 0.5) / cols) * 2 - 1;
			const ny = ((row + 0.5) / rows) * 2 - 1;
			const u = Math.hypot(nx, ny);
			const falloff = u < 1 ? (1 - u) ** 2 : 0;
			const angle = -twist * falloff;
			const reach = 1 + pull * falloff;
			const sx = (nx * Math.cos(angle) - ny * Math.sin(angle)) * reach;
			const sy = (nx * Math.sin(angle) + ny * Math.cos(angle)) * reach;
			const index = (row * cols + col) * 2;
			offsets[index] = (sx - nx) * rx;
			offsets[index + 1] = (sy - ny) * ry;
			largest = Math.max(largest, Math.abs(offsets[index]), Math.abs(offsets[index + 1]));
		}
	}
	const scale = Math.max(1, largest * 2);
	const pixels = new Uint8ClampedArray(cols * rows * 4);
	for (let cell = 0; cell < cols * rows; cell++) {
		pixels[cell * 4] = Math.round((offsets[cell * 2] / scale + 0.5) * 255);
		pixels[cell * 4 + 1] = Math.round((offsets[cell * 2 + 1] / scale + 0.5) * 255);
		pixels[cell * 4 + 2] = 128;
		pixels[cell * 4 + 3] = 255;
	}
	return { pixels, scale };
}

function swirlImage(width: number, height: number): { href: string; scale: number } | undefined {
	const cols = Math.round((256 * width) / Math.max(width, height));
	const rows = Math.round((256 * height) / Math.max(width, height));
	const canvas = document.createElement('canvas');
	canvas.width = cols;
	canvas.height = rows;
	const context = canvas.getContext('2d');
	if (!context) return undefined;
	const { pixels, scale } = swirlMap(cols, rows, width, height);
	context.putImageData(new ImageData(pixels, cols, rows), 0, 0);
	return { href: canvas.toDataURL(), scale };
}

const ARMS = spiralArms();
const TURN = Math.PI * 2;

function clamp(value: number): number {
	return Math.min(1, Math.max(0, value));
}

/** Paints the vortex for `progress` (0 to 1) over the whole canvas. */
function paintVortex(context: CanvasRenderingContext2D, width: number, height: number, progress: number, arms: Path2D[]) {
	const vmax = Math.max(width, height) / 100;
	const vmin = Math.min(width, height) / 100;
	const cx = width / 2;
	const cy = height / 2;
	const spin = progress * progress;
	const radius = (holeDiameter(progress) * vmax) / 2;
	context.clearRect(0, 0, width, height);

	if (radius > 0) {
		// The page darkens as it nears the edge, so the hole reads as depth.
		const halo = context.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.6);
		halo.addColorStop(0, 'rgb(5 2 10 / 0)');
		halo.addColorStop(0.22, 'rgb(5 2 10 / 0.85)');
		halo.addColorStop(0.5, 'rgb(28 17 48 / 0.35)');
		halo.addColorStop(1, 'rgb(28 17 48 / 0)');
		context.fillStyle = halo;
		context.fillRect(0, 0, width, height);

		context.save();
		context.beginPath();
		context.arc(cx, cy, radius, 0, TURN);
		context.clip();

		const swirlRadius = 80 * vmax * (0.7 + 0.7 * spin);
		const ground = context.createRadialGradient(cx, cy, 0, cx, cy, swirlRadius);
		ground.addColorStop(0, '#1c1130');
		ground.addColorStop(0.7, '#0b0612');
		context.fillStyle = ground;
		context.fillRect(0, 0, width, height);

		const bands = context.createConicGradient(-1.5 * TURN * spin, cx, cy);
		for (let band = 0; band < 14; band++) {
			bands.addColorStop(band / 14, '#0b0612');
			bands.addColorStop((band + 0.4) / 14, '#0b0612');
			bands.addColorStop((band + 0.65) / 14, '#3a2260');
		}
		bands.addColorStop(1, '#0b0612');
		context.fillStyle = bands;
		context.globalAlpha = 0.9;
		context.fillRect(0, 0, width, height);
		const fade = context.createRadialGradient(cx, cy, swirlRadius * 0.45, cx, cy, swirlRadius * 0.7);
		fade.addColorStop(0, 'rgb(11 6 18 / 0)');
		fade.addColorStop(1, '#0b0612');
		context.fillStyle = fade;
		context.globalAlpha = 1;
		context.fillRect(0, 0, width, height);

		context.save();
		context.translate(cx, cy);
		context.rotate(3 * TURN * spin);
		context.scale(swirlRadius / 100, swirlRadius / 100);
		context.lineCap = 'round';
		context.strokeStyle = 'rgb(75 50 119 / 0.55)';
		context.lineWidth = 7;
		for (const arm of arms) context.stroke(arm);
		context.lineWidth = 1.2;
		arms.forEach((arm, index) => {
			context.strokeStyle = index % 2 === 0 ? 'rgb(157 255 106 / 0.55)' : 'rgb(185 163 230 / 0.7)';
			context.stroke(arm);
		});
		context.restore();

		const rim = context.createRadialGradient(cx, cy, Math.max(0, radius - 6 * vmax), cx, cy, radius);
		rim.addColorStop(0, 'rgb(75 50 119 / 0)');
		rim.addColorStop(0.75, 'rgb(75 50 119 / 0.5)');
		rim.addColorStop(0.9, 'rgb(157 255 106 / 0.25)');
		rim.addColorStop(1, 'rgb(157 255 106 / 0.6)');
		context.fillStyle = rim;
		context.fillRect(0, 0, width, height);
		context.restore();
	}

	if (progress > 0.3) {
		let grow = 1.2 + ((progress - 0.9) / 0.1) * 4.8;
		if (progress < 0.65) grow = ((progress - 0.3) / 0.35) * 0.3;
		else if (progress < 0.9) grow = 0.3 + ((progress - 0.65) / 0.25) * 0.9;
		const coreRadius = 15 * vmin * grow;
		const core = context.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
		core.addColorStop(0, `rgb(157 255 106 / ${clamp((progress - 0.3) / 0.35 + 0.3)})`);
		core.addColorStop(0.3, 'rgb(157 255 106 / 0.35)');
		core.addColorStop(0.7, 'rgb(157 255 106 / 0)');
		context.fillStyle = core;
		context.fillRect(0, 0, width, height);
	}

	if (progress > 0.9) {
		context.fillStyle = `rgb(0 0 0 / ${clamp((progress - 0.9) / 0.1)})`;
		context.fillRect(0, 0, width, height);
	}
}

/**
 * Twists the live page into a swirl while a hole opens at its eye and swallows
 * it, then calls `onDone`. Returns a reset for pages restored from the
 * back/forward cache.
 */
export function fallIntoVortex(overlay: HTMLElement, filter: SVGFilterElement | null, onDone: () => void): () => void {
	const root = document.documentElement;
	const page = [...document.body.children].filter(
		(child): child is HTMLElement =>
			child instanceof HTMLElement && child !== overlay && !['SCRIPT', 'STYLE', 'TEMPLATE'].includes(child.tagName)
	);
	document.body.append(overlay);
	overlay.classList.add('is-falling');
	// Keep the scrollbar's room so hiding it does not reflow the page sideways.
	if (innerWidth > root.clientWidth) root.style.scrollbarGutter = 'stable';
	root.style.overflow = 'hidden';

	const canvas = overlay.querySelector('canvas');
	const context = canvas?.getContext('2d');
	const ratio = Math.min(devicePixelRatio || 1, 2);
	const width = innerWidth * ratio;
	const height = innerHeight * ratio;
	if (canvas) {
		canvas.width = width;
		canvas.height = height;
	}
	const arms = ARMS.map((d) => new Path2D(d));

	const start = performance.now();
	let cancelled = false;
	let frame = 0;
	let displacements: Element[] = [];
	let swirlScale = 0;
	const twisted: { element: HTMLElement; filter: SVGFilterElement }[] = [];

	const twistPage = async (template: SVGFilterElement) => {
		const map = swirlImage(innerWidth, innerHeight);
		if (!map) return;
		// Until the map is decoded the filter reads it as transparent and throws the whole page up and to the left.
		const image = new Image();
		image.src = map.href;
		await image.decode().catch(() => undefined);
		if (cancelled || performance.now() - start >= COVERED * VORTEX_MS) return;
		// One filter per top-level element, so the vortex above stays out of it and fixed elements keep their place.
		// Each filter works in its element's own space, so the viewport is placed relative to that element's box.
		page.forEach((element, index) => {
			const box = element.getBoundingClientRect();
			if (box.width === 0 || box.bottom < 0 || box.top > innerHeight) return;
			const copy = template.cloneNode(true) as SVGFilterElement;
			copy.id = `${template.id}-${index}`;
			const region = { x: -box.left, y: -box.top, width: innerWidth, height: innerHeight };
			for (const target of [copy, copy.querySelector('feImage')]) {
				for (const [name, value] of Object.entries(region)) target?.setAttribute(name, String(value));
			}
			copy.querySelector('feImage')?.setAttribute('href', map.href);
			template.after(copy);
			element.style.filter = `url(#${copy.id})`;
			twisted.push({ element, filter: copy });
		});
		displacements = twisted.flatMap(({ filter }) => [...filter.querySelectorAll('feDisplacementMap')]);
		swirlScale = map.scale;
	};
	if (filter) void twistPage(filter);

	let hidden = false;
	const tick = (now: number) => {
		const progress = clamp((now - start) / VORTEX_MS);
		if (context) paintVortex(context, width, height, progress, arms);
		// Once the hole covers the screen, stop filtering a page nobody can see.
		if (progress >= COVERED && !hidden) {
			hidden = true;
			for (const element of page) element.style.visibility = 'hidden';
		} else if (!hidden) {
			const scale = String(swirlScale * swirlStrength(progress));
			for (const displacement of displacements) displacement.setAttribute('scale', scale);
		}
		if (progress < 1) frame = requestAnimationFrame(tick);
	};
	frame = requestAnimationFrame(tick);
	const done = setTimeout(onDone, VORTEX_MS);

	return () => {
		cancelled = true;
		clearTimeout(done);
		cancelAnimationFrame(frame);
		context?.clearRect(0, 0, width, height);
		for (const element of page) element.style.visibility = '';
		for (const { element, filter } of twisted) {
			element.style.filter = '';
			filter.remove();
		}
		overlay.classList.remove('is-falling');
		root.style.overflow = '';
		root.style.scrollbarGutter = '';
	};
}
