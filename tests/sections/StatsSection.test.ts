import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import StatsSection from '@sections/Stats.svelte';

const chartDestroyMock = vi.fn();

vi.mock('chart.js', () => {
  const Chart = vi.fn().mockImplementation(function () {
    return {
      destroy: chartDestroyMock,
    };
  }) as any;
  Chart.register = vi.fn();

  return {
    Chart,
    registerables: ['bar', 'line'],
  };
});

describe('StatsSection', () => {
  let target: HTMLElement;

  beforeEach(() => {
    Object.defineProperty(import.meta, 'env', {
      value: {
        PUBLIC_API_URL: 'https://api.test.local',
        PUBLIC_DEFAULT_SEASON: '3',
      },
      writable: true,
    });

    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    vi.useFakeTimers();

    target = document.createElement('div');
    document.body.appendChild(target);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('shows the loading spinner initially', () => {
    (global.fetch as any) = vi.fn().mockReturnValue(new Promise(() => {}));

    const instance = mount(StatsSection as any, { target });

    expect(target.innerHTML).toContain('loading-spinner');

    unmount(instance);
  });

  it('renders stats content after fetching banlists', async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue({
      json: async () => ['2024-01', '2024-02', 'N/A', 'Global'],
    });

    const instance = mount(StatsSection as any, { target });

    await Promise.resolve();
    await vi.runAllTimersAsync();
    await Promise.resolve();

    expect(target.innerHTML).toContain('Total Duels This Season');
    expect(target.innerHTML).toContain('6,000');
    expect(target.innerHTML).toContain('Active Banlists');
    expect(target.innerHTML).toContain('2');
    expect(target.innerHTML).toContain('Avg. Duels per Banlist');
    expect(target.innerHTML).toContain('3,000');

    expect(target.innerHTML).toContain('2024-01');
    expect(target.innerHTML).toContain('2024-02');
    expect(target.innerHTML).toContain('50.0%');

    const { Chart } = await import('chart.js');
    expect(Chart).toHaveBeenCalledTimes(3);

    unmount(instance);
  });
});
