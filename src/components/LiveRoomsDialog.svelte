<script lang="ts">
	import { roomsStore } from '@stores/rooms/roomsStore';
	import { watchableRoomIds } from '@stores/watch/watchRoomsStore';
	import {
		isRoomRanked,
		lpBaseline,
		roomNoteTags,
		teamLp,
		teamPlayers,
		teamScore,
	} from '@utils/liveRoom';
	import LpSide from '@components/Cards/LpSide.svelte';

	let dialog: HTMLDialogElement;

	$: uniqueUsersOnlineCount = new Set($roomsStore.flatMap((room) => room.players.map((p) => p.username))).size;

	const closeDialog = () => dialog?.close();
</script>

<dialog id="match-card-dialog" class="modal" bind:this={dialog}>
	<div class="modal-box flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden border border-base-content/10 bg-base-300 p-0">
		<header class="flex items-center justify-between gap-4 border-b border-base-content/10 px-5 py-4">
			<div class="min-w-0">
				<h3 class="flex items-center gap-2.5 text-lg font-bold">
					<span class="relative flex size-2.5" aria-hidden="true">
						<span class="absolute inline-flex size-full rounded-full bg-error opacity-75 motion-safe:animate-ping"></span>
						<span class="relative inline-flex size-2.5 rounded-full bg-error"></span>
					</span>
					Live Rooms
				</h3>
				<p class="mt-0.5 text-sm opacity-60">
					<span class="tabular-nums">{$roomsStore.length}</span> rooms ·
					<span class="tabular-nums">{uniqueUsersOnlineCount}</span> players online
				</p>
			</div>
			<button type="button" class="btn btn-sm btn-circle btn-ghost" aria-label="Close" on:click={closeDialog}>
				<svg viewBox="0 0 24 24" class="size-5" fill="currentColor" aria-hidden="true">
					<path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
				</svg>
			</button>
		</header>

		{#if $roomsStore.length === 0}
			<p class="px-5 py-12 text-center text-sm opacity-60">No duels running right now. Check back in a moment.</p>
		{:else}
			<ul class="flex-1 divide-y divide-base-content/10 overflow-y-auto overscroll-contain">
				{#each $roomsStore as room (room.id)}
					{@const ranked = isRoomRanked(room)}
					{@const baseline = lpBaseline(room)}
					<li class="live-row grid gap-x-5 gap-y-3 px-5 py-4 {ranked ? 'bg-gold/[0.04]' : ''}">
						<div class="[grid-area:meta] flex min-w-0 flex-col gap-1.5">
							<span class="truncate text-sm font-medium">
								<span class="opacity-60">Bo{room.bestOf} ·</span>
								{room.banList.name}
							</span>
							{#if ranked || roomNoteTags(room).length > 0}
								<span class="flex flex-wrap gap-1">
									{#if ranked}
										<span class="badge badge-sm badge-outline border-gold/60 font-semibold text-gold">Ranked</span>
									{/if}
									{#each roomNoteTags(room) as note}
										<span class="badge badge-sm border-base-content/10 bg-base-100 opacity-80">{note}</span>
									{/each}
								</span>
							{/if}
						</div>

						<div class="[grid-area:p1] min-w-0 self-center">
							<LpSide players={teamPlayers(room, 0)} lp={teamLp(room, 0)} {baseline} banListName={room.banList.name} />
						</div>

						<div class="[grid-area:score] flex flex-col items-center justify-center self-center leading-tight">
							<span class="text-xl font-bold tabular-nums {ranked ? 'text-gold' : ''}">
								{teamScore(room, 0)}–{teamScore(room, 1)}
							</span>
							<span class="text-xs tabular-nums opacity-60">Turn {room.turn}</span>
						</div>

						<div class="[grid-area:p2] min-w-0 self-center">
							<LpSide
								players={teamPlayers(room, 1)}
								lp={teamLp(room, 1)}
								{baseline}
								banListName={room.banList.name}
								side="right"
							/>
						</div>

						<div class="[grid-area:watch] flex items-center justify-end">
							{#if $watchableRoomIds.has(room.id)}
								<a
									href={`/watch?room=${room.id}`}
									class="btn btn-sm btn-primary gap-2"
									data-umami-event="live-table-click-watch"
								>
									<span class="size-1.5 rounded-full bg-primary-content motion-safe:animate-pulse" aria-hidden="true"></span>
									Watch
								</a>
							{:else}
								<span
									class="tooltip tooltip-left flex size-8 items-center justify-center rounded-full opacity-40"
									data-tip="Private room or spectators refused"
								>
									<svg viewBox="0 0 24 24" class="size-4" fill="currentColor" role="img" aria-label="Not watchable">
										<path d="M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
									</svg>
								</span>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close">close</button>
	</form>
</dialog>

<style>
	.live-row {
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		grid-template-areas:
			'meta meta watch'
			'p1 score p2';
	}

	@media (min-width: 768px) {
		.live-row {
			grid-template-columns: minmax(0, 11rem) minmax(0, 1fr) 5rem minmax(0, 1fr) 6.5rem;
			grid-template-areas: 'meta p1 score p2 watch';
		}
	}
</style>
