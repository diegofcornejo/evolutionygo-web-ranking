<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import type { Room, WatchRoom } from '@types';
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
	import { lpBaseline, teamLp, teamPlayers, teamScore } from '@utils/liveRoom';
	import LpSide from '@components/Cards/LpSide.svelte';

	/**
	 * Joining a room replays the whole duel to the spectator, so frames are kept
	 * alive and hidden instead of being recreated. Each one holds an open
	 * WebSocket, so they are capped and the least recently watched is dropped.
	 */
	const MAX_LIVE_FRAMES = 4;

	/** Rows the list shows before it scrolls, so its height tracks the board. */
	const VISIBLE_ROOMS = 5;

	/** Material Design Icons paths, inlined: astro-icon only renders in .astro. */
	const ICONS = {
		search:
			'M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5',
		eye: 'M12 9a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5 5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5',
		link: 'M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.98 2.98 0 0 0 0-4.24 2.98 2.98 0 0 0-4.24 0l-3.53 3.53a2.98 2.98 0 0 0 0 4.24m2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.98 2.98 0 0 0 0 4.24 2.98 2.98 0 0 0 4.24 0l3.53-3.53a2.98 2.98 0 0 0 0-4.24.973.973 0 0 1 0-1.42',
		code: 'M14.6 16.6 19.2 12l-4.6-4.6L16 6l6 6-6 6zm-5.2 0L4.8 12l4.6-4.6L8 6l-6 6 6 6z',
		openInNew:
			'M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z',
		fullscreen: 'M5 5h5v2H7v3H5zm9 0h5v5h-2V7h-3zm3 9h2v5h-5v-2h3zm-7 3v2H5v-5h2v3z',
	};

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
	let activeLive = $derived(activeRoomId === null ? null : liveRoomFor(activeRoomId));
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

	const liveRoomFor = (roomId: number) => {
		const live = liveById.get(roomId);
		if (!live) return null;
		const hasBothTeams = [0, 1].every((team) => live.players.some((player) => player.team === team));
		return hasBothTeams ? live : null;
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

{#snippet icon(path: string, size = 'size-4')}
	<svg viewBox="0 0 24 24" class="{size} shrink-0" fill="currentColor" aria-hidden="true"><path d={path} /></svg>
{/snippet}

{#snippet scoreline(live: Room, startLp: number | undefined)}
	<span class="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
		<LpSide
			players={teamPlayers(live, 0)}
			lp={teamLp(live, 0)}
			baseline={lpBaseline(live, startLp)}
			banListName={live.banList.name}
			compact
			linked={false}
		/>
		<span class="flex flex-col items-center leading-tight">
			<span class="text-base font-bold tabular-nums">{teamScore(live, 0)}–{teamScore(live, 1)}</span>
			<span class="text-[11px] tabular-nums opacity-60">T{live.turn}</span>
		</span>
		<LpSide
			players={teamPlayers(live, 1)}
			lp={teamLp(live, 1)}
			baseline={lpBaseline(live, startLp)}
			banListName={live.banList.name}
			side="right"
			compact
			linked={false}
		/>
	</span>
{/snippet}

{#snippet roomStatus(room: WatchRoom)}
	<span class="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
		<span
			class="size-1.5 shrink-0 rounded-full {isRoomLive(room)
				? 'bg-error motion-safe:animate-pulse'
				: 'bg-base-content/40'}"
		></span>
		<span class={isRoomLive(room) ? 'text-error' : 'opacity-60'}>{statusLabel(room)}</span>
		<span class="truncate opacity-60">· #{room.id} · Bo{room.bestOf} · {room.banlist}</span>
	</span>
{/snippet}

<section class="w-full text-base">
	<div class="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:items-start">
		<aside
			class="order-2 flex flex-col gap-3 rounded-box border border-base-content/10 bg-base-200 p-3 lg:order-1 lg:sticky lg:top-20"
		>
			<header class="flex items-baseline justify-between gap-2 px-1">
				<h2 class="font-semibold">Live duels</h2>
				{#if rooms.length > 0}
					<span class="text-xs tabular-nums opacity-60">{visibleRooms.length} of {rooms.length} duels</span>
				{/if}
			</header>

			{#if rooms.length > 0}
				<label class="input input-sm flex w-full items-center gap-2 bg-base-100">
					<span class="opacity-50">{@render icon(ICONS.search)}</span>
					<input
						type="search"
						class="grow"
						placeholder="Search duelist, room, banlist"
						aria-label="Search duels"
						data-umami-event="watch-search"
						bind:value={search}
					/>
				</label>
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
					class="flex w-full list-none flex-col flex-nowrap gap-2 overflow-y-auto overflow-x-hidden overscroll-contain p-0 max-h-[70vh]"
					style={listMaxHeight ? `max-height: ${listMaxHeight}` : undefined}
				>
					{#each visibleRooms as room (room.id)}
						{@const live = liveRoomFor(room.id)}
						<li>
							<button
								type="button"
								class="flex w-full flex-col gap-2.5 rounded-box border p-3 text-left transition-colors duration-200 {room.id ===
								activeRoomId
									? 'border-primary bg-primary/10'
									: 'border-base-content/10 bg-base-100/40 hover:border-primary/40 hover:bg-base-300'}"
								aria-current={room.id === activeRoomId ? 'true' : undefined}
								data-umami-event="watch-select-room"
								onclick={() => selectRoom(room.id)}
							>
								<span class="flex w-full items-center justify-between gap-2">
									{@render roomStatus(room)}
									<span class="flex shrink-0 items-center gap-1 text-xs tabular-nums opacity-60" title="Spectators">
										{@render icon(ICONS.eye, 'size-3.5')}
										{room.spectators ?? 0}
									</span>
								</span>

								{#if live}
									{@render scoreline(live, room.startLp)}
								{:else}
									<span class="w-full truncate text-sm font-medium" title={roomMatchup(room)}>
										{roomMatchup(room)}
									</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{/if}

			{#if rooms.length > 0 && status === 'error'}
				<p class="px-1 text-center text-xs opacity-50">
					The rooms listing is unreachable — showing the last duels we saw.
				</p>
			{/if}

			<p class="px-1 text-xs opacity-50">
				Public casual duels only. You are joined as a spectator, never as a player.
			</p>
		</aside>

		<div class="order-1 flex min-w-0 flex-col gap-3 lg:order-2">
			<div class="overflow-hidden rounded-box border border-base-content/10 bg-base-200">
				<div
					class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-base-content/10 px-4 py-2.5"
				>
					<div class="min-w-0">
						{#if activeRoom}
							<p class="truncate font-semibold" title={roomMatchup(activeRoom)}>
								{roomMatchup(activeRoom)}
								{#if activeLive}
									<span class="ml-1.5 tabular-nums text-primary">
										{teamScore(activeLive, 0)}–{teamScore(activeLive, 1)}
									</span>
								{/if}
							</p>
							<p class="mt-0.5 text-[11px] font-semibold uppercase tracking-wide">
								<span
									class="mr-1 inline-block size-1.5 rounded-full align-middle {isRoomLive(activeRoom)
										? 'bg-error motion-safe:animate-pulse'
										: 'bg-base-content/40'}"
								></span>
								<span class={isRoomLive(activeRoom) ? 'text-error' : 'opacity-60'}>{statusLabel(activeRoom)}</span>
								<span class="opacity-60">
									· #{activeRoom.id} · Bo{activeRoom.bestOf} · {activeRoom.banlist} · {activeRoom.rule} ·
									{activeRoom.startLp}&nbsp;LP{activeLive ? ` · Turn\u00a0${activeLive.turn}` : ''}
								</span>
							</p>
						{:else if activeRoomId !== null}
							<p class="text-sm font-semibold">Room #{activeRoomId}</p>
							<p class="text-xs opacity-60">Not in the current listing — the duel may have ended.</p>
						{:else}
							<p class="text-sm opacity-60">No duel selected</p>
						{/if}
					</div>

					{#if activeRoomId !== null}
						<div class="flex flex-wrap items-center gap-1">
							<div
								class="tooltip tooltip-bottom"
								data-tip="The 3D board downloads a WebGL engine (~2.5 MB) and needs a GPU. The renderer is fixed per duel, so switching it reloads the board."
							>
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
							</div>

							<button
								type="button"
								class="btn btn-sm btn-ghost max-sm:btn-square"
								data-umami-event="watch-copy-link"
								onclick={() => copy('link', shareUrl)}
							>
								{@render icon(ICONS.link)}
								<span class="max-sm:sr-only">{copied === 'link' ? 'Copied!' : 'Copy link'}</span>
							</button>

							<button
								type="button"
								class="btn btn-sm btn-ghost max-sm:btn-square {showSnippet ? 'btn-active' : ''}"
								aria-expanded={showSnippet}
								data-umami-event="watch-toggle-embed"
								onclick={() => (showSnippet = !showSnippet)}
							>
								{@render icon(ICONS.code)}
								<span class="max-sm:sr-only">{showSnippet ? 'Hide embed code' : 'Embed code'}</span>
							</button>

							<a
								class="btn btn-sm btn-ghost max-sm:btn-square"
								href={shareUrl}
								target="_blank"
								rel="noopener"
								data-umami-event="watch-open-client"
							>
								{@render icon(ICONS.openInNew)}
								<span class="max-sm:sr-only">Open in the client</span>
							</a>

							<button
								type="button"
								class="btn btn-sm btn-ghost btn-square"
								aria-label="Fullscreen"
								title="Fullscreen"
								data-umami-event="watch-fullscreen"
								onclick={goFullscreen}
							>
								{@render icon(ICONS.fullscreen, 'size-5')}
							</button>
						</div>
					{/if}
				</div>

				<div
					bind:this={stageEl}
					class="relative aspect-[16/10] max-h-[calc(100dvh-9rem)] min-h-64 w-full overflow-hidden bg-base-300"
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
			</div>

			{#if activeRoomId !== null && showSnippet}
				<div class="rounded-box border border-base-content/10 bg-base-200 p-4">
					<div class="mb-3 flex items-center justify-between gap-2">
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
						class="textarea h-40 w-full bg-base-100 font-mono text-xs"
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
