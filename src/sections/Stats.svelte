<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  
  Chart.register(...registerables);

  const API_URL = import.meta.env.PUBLIC_API_URL;
  const DEFAULT_SEASON = import.meta.env.PUBLIC_DEFAULT_SEASON;

  let season = $state<string>(DEFAULT_SEASON);
  let loading = $state<boolean>(true);
  let totalDuels = $state<number>(0);
  let activeBanLists = $state<number>(0);
  let avgDuelsPerBanList = $state<number>(0);
  let dataReady = $state<boolean>(false);
  
  // Visualization instances
  let banlistChartInstance: Chart | null = null;
  let seasonComparisonInstance: Chart | null = null;
  let dailyStackedInstance: Chart | null = null;

  // Canvas references
  let banlistChartCanvas: HTMLCanvasElement | undefined = $state();
  let seasonComparisonCanvas: HTMLCanvasElement | undefined = $state();
  let dailyStackedCanvas: HTMLCanvasElement | undefined = $state();

  interface BanlistDuelData {
    banlist: string;
    duels: number;
    percentage: number;
    popularity: number;
  }

  interface HistoricalSeasonData {
    name: string;
    value: number;
  }

  interface DailyDuelData {
    date: string;
    banListName: string;
    count: number;
  }

  interface HistoricalStatsResponse {
    stats?: {
      totalDuels?: number;
      activeBanLists?: number;
      avgDuelsPerBanList?: number;
    };
    historical?: HistoricalSeasonData[];
    banListBreakdown?: {
      banListName: string;
      totalDuels: number;
      percentage?: number;
      popularity?: number;
    }[];
    dailyDuels?: DailyDuelData[];
  }
  
  let banlistDuelData = $state<BanlistDuelData[]>([]);
  let historicalSeasonData = $state<HistoricalSeasonData[]>([]);
  let dailyDuelsData = $state<DailyDuelData[]>([]);
  
  // Derived sorted data for the table (avoid mutating state in template)
  let sortedBanlistData = $derived([...banlistDuelData].sort((a, b) => b.duels - a.duels));

  // Vibrant color palette inspired by YGO cards
  const colors = {
    primary: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#06B6D4', '#84CC16'],
    backgrounds: ['rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(6, 182, 212, 0.8)', 'rgba(132, 204, 22, 0.8)'],
    borders: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#06B6D4', '#84CC16'],
  };

  const getHistoricalStats = async () => {
    try {
      const response = await fetch(`${API_URL}/historical-stats?season=${season}`);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: HistoricalStatsResponse = await response.json();

      banlistDuelData = (data.banListBreakdown ?? []).map((item) => ({
        banlist: item.banListName,
        duels: item.totalDuels,
        percentage: item.percentage ?? 0,
        popularity: item.popularity ?? 0,
      }));

      historicalSeasonData = data.historical ?? [];
      dailyDuelsData = data.dailyDuels ?? [];

      totalDuels = data.stats?.totalDuels ?? banlistDuelData.reduce((acc, item) => acc + item.duels, 0);
      activeBanLists = data.stats?.activeBanLists ?? banlistDuelData.length;
      avgDuelsPerBanList = data.stats?.avgDuelsPerBanList ?? Math.round(totalDuels / Math.max(activeBanLists, 1));
    } catch (error) {
      console.error('Error fetching historical stats:', error);
      banlistDuelData = [];
      historicalSeasonData = [];
      dailyDuelsData = [];
      totalDuels = 0;
      activeBanLists = 0;
      avgDuelsPerBanList = 0;
    } finally {
      loading = false;
      dataReady = true;
    }
  };

  const handleSeasonChange = () => {
    loading = true;
    dataReady = false;
    getHistoricalStats();
  };

  const destroyCharts = () => {
    if (banlistChartInstance) {
      banlistChartInstance.destroy();
      banlistChartInstance = null;
    }
    if (seasonComparisonInstance) {
      seasonComparisonInstance.destroy();
      seasonComparisonInstance = null;
    }
    if (dailyStackedInstance) {
      dailyStackedInstance.destroy();
      dailyStackedInstance = null;
    }
  };

  // Effect to create visualizations when canvas elements are ready and data is loaded
  $effect(() => {
    if (!dataReady || !banlistChartCanvas || !seasonComparisonCanvas || !dailyStackedCanvas) {
      return;
    }
    
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
      updateCharts();
    }, 50);
  });

  const updateCharts = () => {
    destroyCharts();
    
    if (!banlistChartCanvas || !seasonComparisonCanvas || !dailyStackedCanvas) return;

    // Duels per Banlist - Bar Chart
    banlistChartInstance = new Chart(banlistChartCanvas, {
      type: 'bar',
      data: {
        labels: banlistDuelData.map(d => d.banlist),
        datasets: [{
          label: 'Duels',
          data: banlistDuelData.map(d => d.duels),
          backgroundColor: colors.backgrounds,
          borderColor: colors.borders,
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Duels per Banlist - Season ${season}`,
            color: '#fff',
            font: { size: 18, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { color: '#9CA3AF' }
          },
          x: {
            grid: { display: false },
            ticks: { 
              color: '#9CA3AF',
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });

    const seasonLabels = historicalSeasonData.map((item) => item.name);
    const seasonDuels = historicalSeasonData.map((item) => item.value);
    
    seasonComparisonInstance = new Chart(seasonComparisonCanvas, {
      type: 'line',
      data: {
        labels: seasonLabels,
        datasets: [{
          label: 'Total Duels',
          data: seasonDuels,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#8B5CF6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Duels per Season (Historical)',
            color: '#fff',
            font: { size: 18, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { color: '#9CA3AF' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#9CA3AF' }
          }
        }
      }
    });

    const buildDailyHistoryData = () => {
      if (!dailyDuelsData.length) {
        return { labels: [] as string[], datasets: [] as { label: string; data: number[]; backgroundColor: string; borderColor: string; borderWidth: number; }[] };
      }

      const totalsByBanlist = new Map<string, number>();
      for (const item of dailyDuelsData) {
        totalsByBanlist.set(item.banListName, (totalsByBanlist.get(item.banListName) ?? 0) + item.count);
      }

      const topBanlists = [...totalsByBanlist.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([banlist]) => banlist);

      const uniqueDates = [...new Set(dailyDuelsData.map((item) => item.date))].sort((a, b) => a.localeCompare(b));
      const labels = uniqueDates.map((date) => new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      const byDateBanlist = new Map<string, Map<string, number>>();
      for (const item of dailyDuelsData) {
        if (!topBanlists.includes(item.banListName)) {
          continue;
        }

        const dateMap = byDateBanlist.get(item.date) ?? new Map<string, number>();
        dateMap.set(item.banListName, (dateMap.get(item.banListName) ?? 0) + item.count);
        byDateBanlist.set(item.date, dateMap);
      }

      const datasets = topBanlists.map((banlist, index) => ({
        label: banlist,
        data: uniqueDates.map((date) => byDateBanlist.get(date)?.get(banlist) ?? 0),
        backgroundColor: colors.backgrounds[index % colors.backgrounds.length],
        borderColor: colors.borders[index % colors.borders.length],
        borderWidth: 1,
      }));

      return { labels, datasets };
    };

    const dailyData = buildDailyHistoryData();
    
    // Daily Duels - Stacked Bar Chart
    dailyStackedInstance = new Chart(dailyStackedCanvas, {
      type: 'bar',
      data: {
        labels: dailyData.labels,
        datasets: dailyData.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { 
              color: '#9CA3AF',
              boxWidth: 12,
              padding: 15,
              font: { size: 11 }
            }
          },
          title: {
            display: true,
            text: `Daily Duels by Banlist - Season ${season} (Last 90 Days)`,
            color: '#fff',
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#fff',
            bodyColor: '#9CA3AF',
            borderColor: 'rgba(255,255,255,0.2)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y ?? 0;
                return `${context.dataset.label}: ${value.toLocaleString()} duels`;
              },
              footer: (tooltipItems) => {
                const total = tooltipItems.reduce((sum, item) => sum + (item.parsed.y || 0), 0);
                return `Total: ${total.toLocaleString()} duels`;
              }
            }
          }
        },
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { color: '#9CA3AF' }
          },
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { 
              color: '#9CA3AF',
              maxTicksLimit: 10,
              maxRotation: 0
            }
          }
        }
      }
    });
  };

  onMount(() => {
    getHistoricalStats();
  });

  onDestroy(() => {
    destroyCharts();
  });
</script>

<div class="w-full pb-16">
  <!-- Header -->
  <div class="flex flex-col gap-6 text-center place-items-center mb-12">
    <h1 class="text-3xl md:text-5xl md:leading-[3.5rem] font-bold pt-6 bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
      Season Statistics
    </h1>
    <h2 class="text-lg text-gray-400 leading-8 max-w-4xl">
      Explore detailed statistics about duels, banlists, and player performance across all seasons.
    </h2>
  </div>

  <!-- Season Selector -->
  <div class="flex flex-row justify-center gap-4 mb-8">
    <select 
      class="select select-secondary w-full max-w-xs bg-base-200 border-violet-500/50 focus:border-violet-500" 
      bind:value={season} 
      onchange={handleSeasonChange}
      aria-label="Filter by season"
    >
      {#each Array.from({ length: parseInt(DEFAULT_SEASON) }, (_, index) => index + 1).reverse() as seasonNum}
        <option value={String(seasonNum)}>Season {seasonNum}</option>
      {/each}
    </select>
  </div>

  {#if loading}
    <div class="flex justify-center items-center min-h-[400px]">
      <span class="loading loading-spinner loading-lg text-violet-500"></span>
    </div>
  {:else}
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="card bg-gradient-to-br from-violet-900/40 to-violet-800/20 border border-violet-500/30 shadow-xl shadow-violet-900/20">
        <div class="card-body items-center text-center">
          <div class="text-5xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            {totalDuels.toLocaleString()}
          </div>
          <p class="text-gray-400 mt-2">Total Duels This Season</p>
        </div>
      </div>
      
      <div class="card bg-gradient-to-br from-pink-900/40 to-pink-800/20 border border-pink-500/30 shadow-xl shadow-pink-900/20">
        <div class="card-body items-center text-center">
          <div class="text-5xl font-bold bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent">
            {activeBanLists}
          </div>
          <p class="text-gray-400 mt-2">Active Banlists</p>
        </div>
      </div>
      
      <div class="card bg-gradient-to-br from-amber-900/40 to-amber-800/20 border border-amber-500/30 shadow-xl shadow-amber-900/20">
        <div class="card-body items-center text-center">
          <div class="text-5xl font-bold bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
            {avgDuelsPerBanList.toLocaleString()}
          </div>
          <p class="text-gray-400 mt-2">Avg. Duels per Banlist</p>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Season Comparison -->
      <div class="card bg-base-300/80 backdrop-blur border border-white/10 shadow-2xl">
        <div class="card-body">
          <div class="h-[400px]">
            <canvas bind:this={seasonComparisonCanvas}></canvas>
          </div>
        </div>
      </div>

      <!-- Duels per Banlist -->
      <div class="card bg-base-300/80 backdrop-blur border border-white/10 shadow-2xl">
        <div class="card-body">
          <div class="h-[400px]">
            <canvas bind:this={banlistChartCanvas}></canvas>
          </div>
        </div>
      </div>

      <!-- Daily Duels History - Stacked Bars -->
      <div class="card bg-base-300/80 backdrop-blur border border-white/10 shadow-2xl lg:col-span-2">
        <div class="card-body">
          <div class="h-[400px]">
            <canvas bind:this={dailyStackedCanvas}></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Banlist Breakdown Table -->
    <div class="mt-12">
      <h3 class="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
        Banlist Breakdown
      </h3>
      <div class="overflow-x-auto">
        <table class="table table-zebra bg-base-300/80 backdrop-blur border border-white/10 rounded-xl">
          <thead>
            <tr class="text-gray-300">
              <th class="text-left">Banlist</th>
              <th class="text-right">Total Duels</th>
              <th class="text-right">% of Season</th>
              <th class="text-left">Popularity</th>
            </tr>
          </thead>
          <tbody>
            {#each sortedBanlistData as item, index}
              {@const percentage = Number.isFinite(item.percentage) ? item.percentage.toFixed(1) : ((item.duels / Math.max(totalDuels, 1)) * 100).toFixed(1)}
              <tr class="hover:bg-white/5 transition-colors">
                <td class="font-medium">
                  <div class="flex items-center gap-2">
                    <span 
                      class="w-3 h-3 rounded-full" 
                      style="background-color: {colors.primary[index % colors.primary.length]}"
                    ></span>
                    {item.banlist}
                  </div>
                </td>
                <td class="text-right font-mono">{item.duels.toLocaleString()}</td>
                <td class="text-right font-mono">{percentage}%</td>
                <td>
                  <div class="w-full bg-gray-700 rounded-full h-2.5">
                     <div 
                       class="h-2.5 rounded-full transition-all duration-500" 
                       style="width: {item.popularity}%; background-color: {colors.primary[index % colors.primary.length]}"
                     ></div>
                   </div>
                 </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
