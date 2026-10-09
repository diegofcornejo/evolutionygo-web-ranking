<script lang="ts">
	import type { Room } from '@types';
	import { duelistHref, lpPercent, lpTone } from '@utils/liveRoom';

	export let players: Room['players'];
	export let lp: number;
	export let baseline: number;
	export let banListName: string;
	export let side: 'left' | 'right' = 'left';
	export let compact = false;
	export let linked = true;

	const season = import.meta.env.PUBLIC_DEFAULT_SEASON;

	$: percent = lpPercent(lp, baseline);
	$: mirrored = side === 'right';
</script>

<div class="flex min-w-0 flex-col {compact ? 'gap-1' : 'gap-1.5'}">
	<div
		class="flex min-w-0 {compact ? 'flex-col' : 'items-baseline justify-between gap-3'} {mirrored
			? compact
				? 'items-end'
				: 'flex-row-reverse'
			: ''}"
	>
		<span class="min-w-0 max-w-full truncate {compact ? 'text-sm' : 'text-base'} font-medium {mirrored ? 'text-right' : ''}">
			{#each players as player, index}
				{#if linked}
					<a
						href={duelistHref(player, banListName, season)}
						class="pointer-events-auto relative z-10 hover:underline underline-offset-4 decoration-primary/60"
						title={player.username}
						on:click|stopPropagation
					>{player.username}</a>
				{:else}
					<span title={player.username}>{player.username}</span>
				{/if}{index < players.length - 1 ? ' & ' : ''}
			{/each}
		</span>
		<span class="shrink-0 tabular-nums font-semibold {compact ? 'text-xs opacity-90' : 'text-lg'} {percent <= 25 ? 'text-error' : ''}">
			{lp}
		</span>
	</div>
	<div
		class="flex h-1.5 w-full overflow-hidden rounded-full bg-base-content/10 {mirrored ? 'justify-end' : ''}"
		role="meter"
		aria-label="Life points"
		aria-valuemin="0"
		aria-valuemax={baseline}
		aria-valuenow={lp}
	>
		<div
			class="h-full rounded-full {lpTone(percent)} motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out"
			style="width: {percent}%"
		></div>
	</div>
</div>
