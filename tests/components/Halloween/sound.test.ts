import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createShadowRealmSound } from '@components/Halloween/sound';

const param = () => ({
  value: 0,
  setValueAtTime: vi.fn(),
  linearRampToValueAtTime: vi.fn(),
  exponentialRampToValueAtTime: vi.fn(),
  setTargetAtTime: vi.fn(),
  cancelScheduledValues: vi.fn(),
});

const node = () => {
  const target: Record<string | symbol, unknown> = { start: vi.fn(), stop: vi.fn() };
  const proxy: Record<string, any> = new Proxy(target, {
    get: (object, key) => (key in object ? object[key] : (object[key] = param())),
  });
  target.connect = vi.fn((next) => next);
  return proxy;
};

const fakeContext = () => {
  const sources: Record<string, any>[] = [];
  const context = {
    state: 'running',
    currentTime: 0,
    sampleRate: 100,
    destination: node(),
    resume: vi.fn(() => Promise.resolve()),
    suspend: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
    createGain: node,
    createBiquadFilter: node,
    createDelay: node,
    createDynamicsCompressor: node,
    createOscillator: node,
    createBufferSource: () => {
      const source = node();
      sources.push(source);
      return source;
    },
    createBuffer: (_channels: number, length: number) => ({ getChannelData: () => new Float32Array(length) }),
  };
  return { context: context as unknown as AudioContext, sources, raw: context };
};

describe('createShadowRealmSound', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates no audio until sound is turned on', () => {
    const create = vi.fn(() => fakeContext().context);
    const sound = createShadowRealmSound(create);

    sound.setHushed(true);
    sound.setHushed(false);
    sound.thunder(0);

    expect(create).not.toHaveBeenCalled();
    expect(sound.on).toBe(false);
  });

  it('starts the ambience on the click that turns it on', () => {
    const fake = fakeContext();
    const sound = createShadowRealmSound(() => fake.context);

    sound.setOn(true);

    expect(sound.on).toBe(true);
    expect(fake.raw.resume).toHaveBeenCalled();
    expect(fake.sources).toHaveLength(1);
    expect(fake.sources[0].start).toHaveBeenCalled();
  });

  it('only thunders while sound is on and the storm is not hushed', () => {
    const fake = fakeContext();
    const sound = createShadowRealmSound(() => fake.context);
    sound.setOn(true);
    const ambience = fake.sources.length;

    sound.thunder(0);
    expect(fake.sources.length - ambience).toBe(1);

    sound.thunder(1);
    expect(fake.sources.length - ambience).toBe(2);

    sound.setHushed(true);
    sound.thunder(0);
    sound.setOn(false);
    sound.thunder(0);
    expect(fake.sources.length - ambience).toBe(2);
  });

  it('whooshes only while sound is on', () => {
    const fake = fakeContext();
    const sound = createShadowRealmSound(() => fake.context);

    sound.whoosh(3);
    sound.setOn(true);
    const ambience = fake.sources.length;
    sound.whoosh(3);

    expect(fake.sources.length - ambience).toBe(1);
    expect(fake.sources.at(-1)!.stop).toHaveBeenCalledWith(3.5);
  });

  it('builds the context even when turned on while hushed, then stays quiet', () => {
    const fake = fakeContext();
    const create = vi.fn(() => fake.context);
    const sound = createShadowRealmSound(create);

    sound.setHushed(true);
    sound.setOn(true);
    vi.runOnlyPendingTimers();

    expect(create).toHaveBeenCalledOnce();
    expect(fake.raw.resume).not.toHaveBeenCalled();
    expect(fake.raw.suspend).toHaveBeenCalled();

    sound.setHushed(false);
    expect(fake.raw.resume).toHaveBeenCalled();
  });

  it('suspends after fading out and closes on navigation', () => {
    const fake = fakeContext();
    const sound = createShadowRealmSound(() => fake.context);
    sound.setOn(true);

    sound.setOn(false);
    expect(fake.raw.suspend).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(fake.raw.suspend).toHaveBeenCalled();

    sound.close();
    expect(fake.raw.close).toHaveBeenCalled();
    expect(sound.on).toBe(false);
  });
});
