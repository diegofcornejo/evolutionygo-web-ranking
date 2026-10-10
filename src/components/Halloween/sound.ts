/**
 * Shadow Realm soundscape, synthesized with Web Audio so it costs no download:
 * a low drone with wind and a sparse, echoing melody, plus a thunderclap for
 * each strike. Nothing is created until the visitor turns sound on, and the
 * context is suspended whenever it goes quiet.
 */

export type ShadowRealmSound = {
	readonly on: boolean;
	/** Call from the click that turns sound on: browsers only start audio on a gesture. */
	setOn(on: boolean): void;
	/** Quiet while the storm is paused or the tab is hidden, without forgetting `on`. */
	setHushed(hushed: boolean): void;
	/** 0 is the nearest pyramid, 1 the farthest: farther thunder arrives later, softer and duller. */
	thunder(distance: number): void;
	/** Wind rising over `seconds`, for the fall into the vortex. */
	whoosh(seconds: number): void;
	close(): void;
};

const LEVEL = 0.7;
const FADE_IN = 2.5;
const FADE_OUT = 0.6;
/** A phrygian line with a tritone, played an octave lower now and then. */
const NOTES = [220, 233.08, 261.63, 311.13, 329.63, 349.23, 440];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function createShadowRealmSound(
	createContext: () => AudioContext = () => new AudioContext()
): ShadowRealmSound {
	let ctx: AudioContext | undefined;
	let master: GainNode;
	let bell: GainNode;
	let storm: GainNode;
	let hiss: AudioBuffer;
	let rumble: AudioBuffer;
	let melody: ReturnType<typeof setTimeout> | undefined;
	let sleep: ReturnType<typeof setTimeout> | undefined;
	let on = false;
	let hushed = false;

	const noise = (context: AudioContext, brown: boolean) => {
		const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
		const data = buffer.getChannelData(0);
		let last = 0;
		for (let i = 0; i < data.length; i++) {
			const white = Math.random() * 2 - 1;
			last = (last + 0.02 * white) / 1.02;
			data[i] = brown ? last * 3.5 : white;
		}
		return buffer;
	};

	const loop = (context: AudioContext, buffer: AudioBuffer) => {
		const source = context.createBufferSource();
		source.buffer = buffer;
		source.loop = true;
		return source;
	};

	const filter = (context: AudioContext, type: BiquadFilterType, frequency: number, q = 1) => {
		const node = context.createBiquadFilter();
		node.type = type;
		node.frequency.value = frequency;
		node.Q.value = q;
		return node;
	};

	const gain = (context: AudioContext, value: number) => {
		const node = context.createGain();
		node.gain.value = value;
		return node;
	};

	const wobble = (context: AudioContext, param: AudioParam, rate: number, depth: number) => {
		const lfo = context.createOscillator();
		lfo.frequency.value = rate;
		lfo.connect(gain(context, depth)).connect(param);
		lfo.start();
	};

	const build = () => {
		const context = createContext();
		const compressor = context.createDynamicsCompressor();
		master = gain(context, 0);
		master.connect(compressor).connect(context.destination);
		hiss = noise(context, false);
		rumble = noise(context, true);

		const music = gain(context, 0.6);
		music.connect(master);

		const droneTone = filter(context, 'lowpass', 240, 5);
		droneTone.connect(gain(context, 0.16)).connect(music);
		for (const frequency of [55, 55.4, 82.41]) {
			const osc = context.createOscillator();
			osc.type = 'sawtooth';
			osc.frequency.value = frequency;
			osc.connect(droneTone);
			osc.start();
		}
		wobble(context, droneTone.frequency, 0.045, 120);

		const windTone = filter(context, 'bandpass', 450, 0.7);
		const windLevel = gain(context, 0.045);
		const wind = loop(context, hiss);
		wind.connect(windTone).connect(windLevel).connect(music);
		wobble(context, windTone.frequency, 0.07, 250);
		wobble(context, windLevel.gain, 0.11, 0.025);
		wind.start();

		bell = gain(context, 1);
		const echo = context.createDelay(2);
		echo.delayTime.value = 0.6;
		const feedback = gain(context, 0.45);
		bell.connect(music);
		bell.connect(echo);
		echo.connect(filter(context, 'lowpass', 2000)).connect(feedback).connect(echo);
		echo.connect(music);

		storm = gain(context, 1);
		storm.connect(master);

		ctx = context;
		return context;
	};

	const fadeTo = (param: AudioParam, value: number, seconds: number) => {
		const now = ctx!.currentTime;
		param.cancelScheduledValues(now);
		param.setValueAtTime(param.value, now);
		param.linearRampToValueAtTime(value, now + seconds);
	};

	const playNote = (context: AudioContext) => {
		const t = context.currentTime;
		const osc = context.createOscillator();
		osc.type = 'triangle';
		osc.frequency.value = NOTES[Math.floor(Math.random() * NOTES.length)] * (Math.random() < 0.25 ? 0.5 : 1);
		const envelope = gain(context, 0);
		envelope.gain.setValueAtTime(0, t);
		envelope.gain.linearRampToValueAtTime(0.09, t + 0.03);
		envelope.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
		osc.connect(envelope).connect(bell);
		osc.start(t);
		osc.stop(t + 4.6);
	};

	const scheduleNote = (context: AudioContext, delay: number) => {
		melody = setTimeout(() => {
			playNote(context);
			scheduleNote(context, rand(3.5, 7.5));
		}, delay * 1000);
	};

	const apply = () => {
		const audible = on && !hushed;
		// Built on the click that turns sound on, even if hushed, so a later resume needs no gesture.
		if (!on && !ctx) return;
		const context = ctx ?? build();
		clearTimeout(sleep);
		if (audible) {
			void context.resume();
			fadeTo(master.gain, LEVEL, FADE_IN);
			if (!melody) scheduleNote(context, 1.5);
			return;
		}
		fadeTo(master.gain, 0, FADE_OUT);
		clearTimeout(melody);
		melody = undefined;
		sleep = setTimeout(() => void context.suspend(), FADE_OUT * 1000 + 100);
	};

	return {
		get on() {
			return on;
		},
		setOn(next) {
			on = next;
			apply();
		},
		setHushed(next) {
			if (hushed === next) return;
			hushed = next;
			apply();
		},
		thunder(distance) {
			if (!ctx || !on || hushed) return;
			const near = 1 - distance;
			const t = ctx.currentTime + 0.25 + distance * 1.4;
			const length = rand(3.5, 4.5) + distance * 2;
			const attack = 0.06 + distance * 0.4;
			const peak = 0.5 + 0.5 * near;

			const body = loop(ctx, rumble);
			const tone = filter(ctx, 'lowpass', 320 + 380 * near);
			tone.frequency.exponentialRampToValueAtTime(60, t + length);
			const level = gain(ctx, 0);
			level.gain.setValueAtTime(0.0001, t);
			level.gain.linearRampToValueAtTime(peak, t + attack);
			let at = t + attack;
			for (let roll = 0; roll < 3; roll++) {
				at += rand(0.3, 0.9);
				level.gain.setTargetAtTime(peak * rand(0.35, 0.9), at, 0.12);
			}
			level.gain.setTargetAtTime(0.0001, at + 0.3, length / 5);
			body.connect(tone).connect(level).connect(storm);
			body.start(t, rand(0, 2));
			body.stop(at + 0.3 + length);
		},
		whoosh(seconds) {
			if (!ctx || !on || hushed) return;
			const t = ctx.currentTime;
			const wind = loop(ctx, hiss);
			const tone = filter(ctx, 'bandpass', 200, 1.2);
			tone.frequency.setValueAtTime(200, t);
			tone.frequency.exponentialRampToValueAtTime(2400, t + seconds);
			const level = gain(ctx, 0);
			level.gain.setValueAtTime(0.0001, t);
			level.gain.exponentialRampToValueAtTime(0.5, t + seconds);
			wind.connect(tone).connect(level).connect(storm);
			wind.start(t, rand(0, 2));
			wind.stop(t + seconds + 0.5);
		},
		close() {
			clearTimeout(melody);
			clearTimeout(sleep);
			melody = undefined;
			on = false;
			void ctx?.close();
			ctx = undefined;
		},
	};
}
