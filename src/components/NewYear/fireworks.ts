/**
 * New Year hero: a countdown to midnight in the visitor's own timezone and a
 * light fireworks show painted on one canvas. The show only runs while the hero
 * is on screen and the tab is visible, and never under reduced motion.
 */

export type Countdown = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

/** Time left until `target`, in whole units; `done` once it has passed. */
export function countdownParts(now: number, target: number): Countdown {
	const left = Math.max(0, Math.floor((target - now) / 1000));
	return {
		days: Math.floor(left / 86400),
		hours: Math.floor((left % 86400) / 3600),
		minutes: Math.floor((left % 3600) / 60),
		seconds: left % 60,
		done: left === 0,
	};
}

/** Local midnight that opens the year being welcomed: this one in January, the next any other month. */
export function welcomedMidnight(now: Date): Date {
	const year = now.getMonth() === 0 ? now.getFullYear() : now.getFullYear() + 1;
	return new Date(year, 0, 1);
}

const PALETTE = ['#f5d27a', '#fff3d6', '#c86bff', '#5fe1ff', '#ff7aa8'];
const GRAVITY = 0.035;
const DRAG = 0.985;

type Rocket = { x: number; y: number; vy: number; apex: number; color: string };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; age: number; color: string };
type Flash = { x: number; y: number; age: number; color: string };

const FLASH_FRAMES = 14;

/** Initial velocities for a round burst of `count` sparks, with a little spread so it never looks stamped. */
export function burstVelocities(count: number, speed: number, random: () => number = Math.random): [number, number][] {
	return Array.from({ length: count }, (_, i) => {
		const angle = (i / count) * Math.PI * 2 + random() * 0.2;
		const force = speed * (0.55 + random() * 0.45);
		return [Math.cos(angle) * force, Math.sin(angle) * force];
	});
}

export type Fireworks = {
	/** Runs while true; stops drawing and clears when false. */
	setActive(active: boolean): void;
	/** A minute of quicker launches, for the stroke of midnight. */
	celebrate(): void;
	destroy(): void;
};

export function startFireworks(canvas: HTMLCanvasElement): Fireworks {
	const context = canvas.getContext('2d');
	const rockets: Rocket[] = [];
	const sparks: Spark[] = [];
	const flashes: Flash[] = [];
	let ratio = 1;
	let width = 0;
	let height = 0;
	let frame = 0;
	let active = false;
	let nextLaunch = 0;
	let celebrateUntil = 0;

	const resize = () => {
		ratio = Math.min(devicePixelRatio || 1, 1.5);
		width = canvas.clientWidth * ratio;
		height = canvas.clientHeight * ratio;
		canvas.width = width;
		canvas.height = height;
	};
	const observer = new ResizeObserver(resize);
	observer.observe(canvas);
	resize();

	const pick = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];

	const launch = () => {
		rockets.push({
			// Mostly to either side of the title, so the bursts frame it instead of covering it.
			x: width * (Math.random() < 0.5 ? 0.06 + Math.random() * 0.3 : 0.64 + Math.random() * 0.3),
			y: height,
			vy: -(height / 70) * (0.85 + Math.random() * 0.3),
			apex: height * (0.12 + Math.random() * 0.3),
			color: pick(),
		});
	};

	const burst = (rocket: Rocket) => {
		const second = Math.random() < 0.35 ? pick() : rocket.color;
		const speed = (Math.min(width, height) / 120) * (0.8 + Math.random() * 0.5);
		flashes.push({ x: rocket.x, y: rocket.y, age: 0, color: rocket.color });
		burstVelocities(64, speed).forEach(([vx, vy], i) => {
			sparks.push({ x: rocket.x, y: rocket.y, vx, vy, life: 70 + Math.random() * 40, age: 0, color: i % 2 ? second : rocket.color });
		});
	};

	const tick = (now: number) => {
		if (!context || !active) return;
		frame = requestAnimationFrame(tick);
		if (now >= nextLaunch) {
			launch();
			const quick = now < celebrateUntil;
			nextLaunch = now + (quick ? 250 + Math.random() * 350 : 900 + Math.random() * 1100);
		}

		context.globalCompositeOperation = 'source-over';
		context.clearRect(0, 0, width, height);
		context.globalCompositeOperation = 'lighter';
		context.lineCap = 'round';

		for (let i = rockets.length - 1; i >= 0; i--) {
			const rocket = rockets[i];
			rocket.y += rocket.vy;
			rocket.vy *= 0.99;
			context.fillStyle = rocket.color;
			context.fillRect(rocket.x - ratio, rocket.y, ratio * 2, ratio * 14);
			if (rocket.y <= rocket.apex || rocket.vy > -1) {
				burst(rocket);
				rockets.splice(i, 1);
			}
		}

		for (let i = flashes.length - 1; i >= 0; i--) {
			const flash = flashes[i];
			const left = 1 - flash.age++ / FLASH_FRAMES;
			if (left <= 0) {
				flashes.splice(i, 1);
				continue;
			}
			const radius = 70 * ratio;
			const glow = context.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, radius);
			glow.addColorStop(0, flash.color);
			glow.addColorStop(1, 'transparent');
			context.globalAlpha = 0.35 * left;
			context.fillStyle = glow;
			context.fillRect(flash.x - radius, flash.y - radius, radius * 2, radius * 2);
		}

		for (let i = sparks.length - 1; i >= 0; i--) {
			const spark = sparks[i];
			spark.vx *= DRAG;
			spark.vy = spark.vy * DRAG + GRAVITY * ratio;
			spark.x += spark.vx;
			spark.y += spark.vy;
			spark.age++;
			const left = 1 - spark.age / spark.life;
			if (left <= 0) {
				sparks.splice(i, 1);
				continue;
			}
			// A short streak behind each spark stands in for a trail, so nothing lingers between frames.
			context.globalAlpha = left;
			context.strokeStyle = spark.color;
			context.lineWidth = 1.6 * ratio;
			context.beginPath();
			context.moveTo(spark.x - spark.vx * 5, spark.y - spark.vy * 5);
			context.lineTo(spark.x, spark.y);
			context.stroke();
			context.fillStyle = spark.color;
			context.beginPath();
			context.arc(spark.x, spark.y, 1.8 * ratio, 0, Math.PI * 2);
			context.fill();
		}
		context.globalAlpha = 1;
	};

	return {
		setActive(next) {
			if (next === active) return;
			active = next;
			if (active) {
				nextLaunch = performance.now() + 300;
				frame = requestAnimationFrame(tick);
			} else {
				cancelAnimationFrame(frame);
				rockets.length = 0;
				sparks.length = 0;
				flashes.length = 0;
				context?.clearRect(0, 0, width, height);
			}
		},
		celebrate() {
			celebrateUntil = performance.now() + 60_000;
		},
		destroy() {
			this.setActive(false);
			observer.disconnect();
		},
	};
}
