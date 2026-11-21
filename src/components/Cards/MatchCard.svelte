<script lang="ts">
	import type { Room } from '@types';
	import { watchableRoomIds } from '@stores/watch/watchRoomsStore';
	import { isRoomRanked, lpBaseline, teamLp, teamPlayers, teamScore } from '@utils/liveRoom';
	import LpSide from '@components/Cards/LpSide.svelte';

	export let room: Room;

	$: ranked = isRoomRanked(room);
	$: baseline = lpBaseline(room);

	const openLiveRoomTable = () => {
		const dialog = document.getElementById('match-card-dialog') as HTMLDialogElement | null;
		dialog?.showModal();
	};
</script>

<div
	class="group relative w-80 shrink-0 rounded-box border bg-base-200 p-3 transition-colors duration-200 {ranked
		? 'border-gold/50 hover:bg-gold/10'
		: 'border-base-content/10 hover:border-primary/40 hover:bg-base-300'}"
>
	<button
		type="button"
		class="absolute inset-0 cursor-pointer rounded-box focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
		aria-label="Show all live rooms"
		on:click={openLiveRoomTable}
	></button>

	<div class="pointer-events-none relative flex flex-col gap-2.5">
		<div class="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide">
			<span class="min-w-0 truncate">
				{#if ranked}
					<span class="text-gold">Ranked</span>
					<span class="opacity-40"> · </span>
				{/if}
				<span class="opacity-60">Bo{room.bestOf} · {room.banList.name}</span>
			</span>
			{#if $watchableRoomIds.has(room.id)}
				<a
					href={`/watch?room=${room.id}`}
					class="pointer-events-auto relative z-10 flex shrink-0 items-center gap-1.5 rounded-full px-1.5 text-error hover:bg-error/15"
					data-umami-event="live-card-click-watch"
					on:click|stopPropagation
				>
					<span class="size-1.5 rounded-full bg-error motion-safe:animate-pulse"></span>
					Watch
				</a>
			{/if}
		</div>

		<div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
			<LpSide players={teamPlayers(room, 0)} lp={teamLp(room, 0)} {baseline} banListName={room.banList.name} compact />
			<div class="flex flex-col items-center leading-tight">
				<span class="text-base font-bold tabular-nums">{teamScore(room, 0)}–{teamScore(room, 1)}</span>
				<span class="text-[11px] tabular-nums opacity-60">T{room.turn}</span>
			</div>
			<LpSide
				players={teamPlayers(room, 1)}
				lp={teamLp(room, 1)}
				{baseline}
				banListName={room.banList.name}
				side="right"
				compact
			/>
		</div>
	</div>
</div>
