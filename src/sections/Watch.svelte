<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import type { WatchRoom } from '@types';
	import { watchRoomsStatus, watchRoomsStore } from '@stores/watch/watchRoomsStore';
	import { fetchWatchRooms, startWatchRoomsPolling } from '@stores/watch/watch-actions';
	import { roomsStore } from '@stores/rooms/roomsStore';
	import {
		buildEmbedSnippet,
		buildShareUrl,
		buildWatchUrl,
		isRoomLive,
		isValidRoomId,
		roomMatchup,
		type BoardRenderer,
	} from '@utils/watchLink';

	/**
	 * Joining a room replays the whole duel to the spectator, so frames are kept
	 * alive and hidden instead of being recreated. Each one holds an open
	 * WebSocket, so they are capped and the least recently watched is dropped.
	 */
	const MAX_LIVE_FRAMES = 4;

	/** Rows the list shows before it scrolls, so its height tracks the board. */
	const VISIBLE_ROOMS = 5;

	type WatchFrame = {
		key: string;
		roomId: number;
		board: BoardRenderer;
		src: string;
	};

	let { initialRoomId = null }: { initialRoomId?: number | null } = $props();

	// The deep-linked room is only a starting point; selection is owned locally.
	const requestedRoomId = untrack(() =>
		isValidRoomId(initialRoomId) ? Number(initialRoomId) : null,
	);

	let activeRoomId = $state<number | null>(requestedRoomId);
	let board = $state<BoardRenderer>('2d');
	let frames = $state<WatchFrame[]>([]);
	let copied = $state<string | null>(null);
	let showSnippet = $state<boolean>(false);
	let search = $state<string>('');
	let stageEl: HTMLDivElement | undefined = $state();
	let listEl: HTMLUListElement | undefined = $state();
	let listMaxHeight = $state<string | null>(null);

	let copyResetTimer: ReturnType<typeof setTimeout> | undefined;
	let stopPolling: (() => void) | undefined;

	let rooms = $derived($watchRoomsStore);
	let status = $derived($watchRoomsStatus);
	let liveById = $derived(new Map($roomsStore.map((room) => [room.id, room])));
	let visibleRooms = $derived(filterRooms(rooms, search));
	let activeRoom = $derived(rooms.find((room) => room.id === activeRoomId) ?? null);
	let activeKey = $derived(activeRoomId === null ? null : frameKey(activeRoomId, board));
	let activeIsListed = $derived(activeRoomId !== null && activeRoom !== null);
	let shareUrl = $derived(activeRoomId === null ? '' : buildShareUrl(activeRoomId));
	let embedSnippet = $derived(activeRoomId === null ? '' : buildEmbedSnippet(activeRoomId, { board }));

	function frameKey(roomId: number, renderer: BoardRenderer) {
		return `${roomId}:${renderer}`;
	}

	function filterRooms(list: WatchRoom[], term: string) {
		const needle = term.trim().toLowerCase();
		if (!needle) return list;

		return list.filter((room) =>
			[
				String(room.id),
				room.banlist,
				room.rule,
				...room.players.map((player) => player.name),
			]
				.join(' ')
				.toLowerCase()
				.includes(needle),
		);
	}

	const ensureFrame = (roomId: number, renderer: BoardRenderer) => {
		const key = frameKey(roomId, renderer);
		const index = frames.findIndex((frame) => frame.key === key);

		if (frames.length > 0 && index === frames.length - 1) return;

		if (index >= 0) {
			frames = [...frames.slice(0, index), ...frames.slice(index + 1), frames[index]];
			return;
		}

		const next = [
			...frames,
			{
				key,
				roomId,
				board: renderer,
				src: buildWatchUrl(roomId, { embed: true, board: renderer, mute: true }),
			},
		];
		frames = next.slice(Math.max(0, next.length - MAX_LIVE_FRAMES));
	};

	const selectRoom = (roomId: number) => {
		activeRoomId = roomId;
		showSnippet = false;
	};

	const copy = async (key: string, text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			copied = key;
			clearTimeout(copyResetTimer);
			copyResetTimer = setTimeout(() => {
				copied = null;
			}, 2000);
		} catch (error) {
			console.error('Error copying to clipboard:', error);
		}
	};

	const goFullscreen = () => {
		stageEl?.requestFullscreen?.();
	};

	/**
	 * Rows are not all the same height (a duel with live data carries an extra
	 * line), so the cap is measured from the rows themselves instead of guessed
	 * as a fixed length.
	 */
	const measureListHeight = () => {
		const items = listEl ? (Array.from(listEl.children) as HTMLElement[]) : [];

		if (items.length <= VISIBLE_ROOMS) {
			listMaxHeight = null;
			return;
		}

		const shown = items.slice(0, VISIBLE_ROOMS);
		const rows = shown.reduce((total, item) => total + item.offsetHeight, 0);
		const gap = parseFloat(getComputedStyle(listEl!).rowGap || '0') || 0;
		const height = rows + gap * (shown.length - 1);

		listMaxHeight = height > 0 ? `${height}px` : null;
	};

	const liveScore = (roomId: number) => {
		const live = liveById.get(roomId);
		if (!live) return null;

		const team0 = live.players.find((player) => player.team === 0);
		const team1 = live.players.find((player) => player.team === 1);
		if (!team0 || !team1) return null;

		return { turn: live.turn, lps: `${team0.lps} - ${team1.lps}`, score: `${team0.score} - ${team1.score}` };
	};

	const statusLabel = (room: WatchRoom) => (isRoomLive(room) ? 'LIVE' : 'WAITING');

	// Nothing is selected on a cold load, so open the top duel of the listing.
	// A deep-linked room is kept even when the listing does not have it: the
	// frame shows its own "room not found" / "not available" state.
	$effect(() => {
		if (activeRoomId === null && rooms.length > 0) {
			activeRoomId = rooms[0].id;
		}
	});

	$effect(() => {
		if (activeRoomId === null) return;
		ensureFrame(activeRoomId, board);
	});

	$effect(() => {
		// Re-measure whenever the rendered rows change.
		void visibleRooms;
		void listEl;
		measureListHeight();
	});

	$effect(() => {
		if (typeof window === 'undefined' || activeRoomId === null) return;

		const url = new URL(window.location.href);
		if (url.searchParams.get('room') === String(activeRoomId)) return;

		url.searchParams.set('room', String(activeRoomId));
		window.history.replaceState(window.history.state, '', url);
	});

	onMount(() => {
		if (activeRoomId === null) {
			const requested = new URLSearchParams(window.location.search).get('room');
			if (isValidRoomId(requested)) {
				activeRoomId = Number(requested);
			}
		}

		stopPolling = startWatchRoomsPolling();
	});

	onDestroy(() => {
		stopPolling?.();
		clearTimeout(copyResetTimer);
	});
</script>

<section class="w-full text-base">
	<header class="mb-4 flex flex-wrap items-center justify-between gap-2">
		<h2 class="text-2xl font-bold">
			Watch live duels
			{#if status === 'ready'}
				<span class="text-base font-normal opacity-60">({rooms.length})</span>
			{/if}
		</h2>
		<p class="text-sm opacity-60">
			Public casual duels only. You are joined as a spectator, never as a player.
		</p>
	</header>

	<div class="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
		<aside
			class="order-2 lg:order-1 card bg-base-300 border border-base-100 p-2 lg:sticky lg:top-20"
		>
			{#if rooms.length > 0}
				<div class="p-1 pb-2">
					<label class="input input-sm input-bordered flex w-full items-center gap-2">
						<span class="opacity-50">🔎</span>
						<input
							type="search"
							class="grow"
							placeholder="Search duelist, room, banlist"
							aria-label="Search duels"
							data-umami-event="watch-search"
							bind:value={search}
						/>
					</label>
					<p class="mt-2 px-1 text-xs opacity-50">
						{visibleRooms.length} of {rooms.length} duels
					</p>
				</div>
			{/if}

			{#if rooms.length === 0 && (status === 'idle' || status === 'loading')}
				<div class="flex justify-center p-6">
					<span class="loading loading-spinner loading-lg text-primary"></span>
				</div>
			{:else if rooms.length === 0 && status === 'error'}
				<div class="p-4 text-center text-sm">
					<p class="mb-3">Something went wrong loading the rooms listing.</p>
					<button class="btn btn-sm btn-primary" onclick={() => fetchWatchRooms()}>Retry</button>
				</div>
			{:else if rooms.length === 0}
				<div class="p-4 text-center text-sm opacity-70">
					<p>No public duels right now.</p>
					<p class="mt-2">
						Private rooms and rooms that refuse spectators are never listed here.
					</p>
				</div>
			{:else if visibleRooms.length === 0}
				<div class="p-4 text-center text-sm opacity-70">
					<p>No duel matches “{search.trim()}”.</p>
					<button class="btn btn-sm btn-ghost mt-3" onclick={() => (search = '')}>
						Clear search
					</button>
				</div>
			{:else}
				<!--
					Plain flex column on purpose: daisyUI's `.menu` is `flex-flow: column wrap`,
					so capping its height makes the rows wrap into extra columns instead of
					scrolling.
				-->
				<ul
					bind:this={listEl}
					class="flex w-full list-none flex-col flex-nowrap gap-1 overflow-y-auto overflow-x-hidden overscroll-contain px-1 py-0 max-h-[70vh]"
					style={listMaxHeight ? `max-height: ${listMaxHeight}` : undefined}
				>
					{#each visibleRooms as room (room.id)}
						{@const live = liveScore(room.id)}
						<li>
							<button
								type="button"
								class="flex w-full flex-col items-start gap-1 rounded-box border p-3 text-left transition-colors duration-200 {room.id ===
								activeRoomId
									? 'border-primary bg-base-200'
									: 'border-transparent hover:bg-neutral'}"
								aria-current={room.id === activeRoomId ? 'true' : undefined}
								data-umami-event="watch-select-room"
								onclick={() => selectRoom(room.id)}
							>
								<span class="flex w-full items-center justify-between gap-2">
									<span class="flex items-center gap-2">
										<span
											class="badge badge-xs {isRoomLive(room) ? 'badge-error' : 'badge-neutral'}"
										></span>
										<span class="text-xs font-semibold tracking-wide opacity-70">
											{statusLabel(room)} · #{room.id}
										</span>
									</span>
									<span class="text-xs opacity-60">👁 {room.spectators ?? 0}</span>
								</span>

								<span class="w-full truncate font-semibold" title={roomMatchup(room)}>
									{roomMatchup(room)}
								</span>

								<span class="w-full truncate text-xs opacity-60">
									{room.banlist} · {room.rule} · Bo{room.bestOf}
								</span>

								{#if live}
									<span class="text-xs opacity-70">
										LP {live.lps} · Score {live.score} · Turn {live.turn}
									</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{/if}

			{#if rooms.length > 0 && status === 'error'}
				<p class="p-2 text-center text-xs opacity-50">
					The rooms listing is unreachable — showing the last duels we saw.
				</p>
			{/if}
		</aside>

		<div class="order-1 lg:order-2 flex flex-col gap-3">
			<div class="flex flex-wrap items-center justify-between gap-2">
				{#if activeRoom}
					<div class="min-w-0">
						<p class="truncate text-lg font-semibold" title={roomMatchup(activeRoom)}>
							{roomMatchup(activeRoom)}
						</p>
						<p class="text-xs opacity-60">
							#{activeRoom.id} · {activeRoom.banlist} · {activeRoom.rule} · Bo{activeRoom.bestOf} ·
							{activeRoom.startLp} LP
						</p>
					</div>
				{:else if activeRoomId !== null}
					<div class="min-w-0">
						<p class="text-lg font-semibold">Room #{activeRoomId}</p>
						<p class="text-xs opacity-60">Not in the current listing — the duel may have ended.</p>
					</div>
				{/if}
			</div>

			<div
				bind:this={stageEl}
				class="relative aspect-[16/10] w-full overflow-hidden rounded-box border border-base-100 bg-base-300"
			>
				{#each frames as frame (frame.key)}
					<iframe
						title={`Live duel ${frame.roomId} on Evolution`}
						src={frame.src}
						allow="fullscreen"
						class="absolute inset-0 h-full w-full border-0 {frame.key === activeKey
							? ''
							: 'watch-frame-idle'}"
					></iframe>
				{/each}

				{#if frames.length === 0}
					<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
						<p class="text-lg font-semibold">Nothing selected</p>
						<p class="text-sm opacity-60">Pick a duel from the list to start watching.</p>
					</div>
				{/if}
			</div>

			{#if activeRoomId !== null}
				<div class="flex flex-wrap items-center gap-2">
					<div class="join" role="group" aria-label="Board renderer">
						<button
							type="button"
							class="btn btn-sm join-item {board === '2d' ? 'btn-primary' : 'btn-neutral'}"
							data-umami-event="watch-board-2d"
							onclick={() => (board = '2d')}
						>
							2D
						</button>
						<button
							type="button"
							class="btn btn-sm join-item {board === '3d' ? 'btn-primary' : 'btn-neutral'}"
							data-umami-event="watch-board-3d"
							onclick={() => (board = '3d')}
						>
							3D
						</button>
					</div>

					<button
						type="button"
						class="btn btn-sm btn-neutral"
						data-umami-event="watch-copy-link"
						onclick={() => copy('link', shareUrl)}
					>
						{copied === 'link' ? 'Copied!' : 'Copy link'}
					</button>

					<button
						type="button"
						class="btn btn-sm btn-neutral"
						data-umami-event="watch-toggle-embed"
						onclick={() => (showSnippet = !showSnippet)}
					>
						{showSnippet ? 'Hide embed code' : 'Embed code'}
					</button>

					<button
						type="button"
						class="btn btn-sm btn-neutral"
						data-umami-event="watch-fullscreen"
						onclick={goFullscreen}
					>
						Fullscreen
					</button>

					<a
						class="btn btn-sm btn-ghost"
						href={shareUrl}
						target="_blank"
						rel="noopener"
						data-umami-event="watch-open-client"
					>
						Open in the client
					</a>
				</div>

				<p class="text-xs opacity-50">
					The 3D board downloads a WebGL engine (~2.5 MB) and needs a GPU. The renderer is fixed per
					duel, so switching it reloads the board.
				</p>

				{#if showSnippet}
					<div class="card bg-base-300 border border-base-100 p-3">
						<div class="mb-2 flex items-center justify-between gap-2">
							<p class="text-sm font-semibold">Embed this duel on your site</p>
							<button
								type="button"
								class="btn btn-xs btn-primary"
								data-umami-event="watch-copy-embed"
								onclick={() => copy('embed', embedSnippet)}
							>
								{copied === 'embed' ? 'Copied!' : 'Copy'}
							</button>
						</div>
						<textarea
							class="textarea textarea-bordered h-40 w-full font-mono text-xs"
							readonly
							aria-label="Embed code"
							value={embedSnippet}
						></textarea>
						<p class="mt-2 text-xs opacity-50">
							No account, API key or build step is needed. Drop <code>embed=1</code> to turn the
							same URL into a normal link.
						</p>
					</div>
				{/if}
			{/if}

			{#if activeRoomId !== null && !activeIsListed && status === 'ready'}
				<div class="alert alert-warning text-sm">
					This room is no longer published in the listing. The board above shows its own end state.
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	/* Kept mounted so the spectator connection survives, but not painted. */
	.watch-frame-idle {
		visibility: hidden;
		pointer-events: none;
	}
</style>
