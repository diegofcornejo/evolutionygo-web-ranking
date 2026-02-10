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

  it('renders stats content after fetching historical stats', async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        stats: {
          totalDuels: 6000,
          activeBanLists: 2,
          avgDuelsPerBanList: 3000,
        },
        historical: [
          { name: 'Season 1', value: 1500 },
          { name: 'Season 2', value: 4200 },
          { name: 'Season 3', value: 6000 },
        ],
        banListBreakdown: [
          { banListName: '2024-01', totalDuels: 4000, percentage: 66.7, popularity: 100 },
          { banListName: '2024-02', totalDuels: 2000, percentage: 33.3, popularity: 50 },
        ],
        dailyDuels: [
          { date: '2026-01-01', banListName: '2024-01', count: 50 },
          { date: '2026-01-01', banListName: '2024-02', count: 20 },
          { date: '2026-01-01', banListName: '2026.01 OCG', count: 1 },
          { date: '2026-01-02', banListName: '2024-01', count: 30 },
          { date: '2026-01-02', banListName: '2024-02', count: 10 },
          { date: '2026-01-02', banListName: '2026.01 OCG', count: 2 },
        ],
      }),
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
    expect(target.innerHTML).toContain('66.7%');

    const firstFetchCall = (global.fetch as any).mock.calls[0][0];
    expect(firstFetchCall).toContain('/historical-stats?season=');

    const { Chart } = await import('chart.js');
    expect(Chart).toHaveBeenCalledTimes(3);
    const dailyChartConfig = (Chart as any).mock.calls[2][1];
    expect(dailyChartConfig.data.datasets).toHaveLength(3);
    expect(dailyChartConfig.data.datasets.map((dataset: { label: string }) => dataset.label)).toContain('2026.01 OCG');

    unmount(instance);
  });
});
