<script lang="ts">
  import type { Room } from 'src/types/Room';
  import { roomsStore } from '@stores/rooms/roomsStore';
  // Para avatares
  const getAvatar = (username: string) => `/avatar.webp?name=${encodeURIComponent(username)}`;

  export let room: Room;

  let team0 = [];
  let team1 = [];

  $: team0 = room.players.filter((p) => p.team === 0);
  $: team1 = room.players.filter((p) => p.team === 1);

  const openLiveRoomTable = () => {
    const dialog = document.getElementById('match-card-dialog') as HTMLDialogElement;
    dialog?.showModal();
  };

  const closeDialog = () => {
    const dialog = document.getElementById('match-card-dialog') as HTMLDialogElement;
    dialog?.close();
  };
</script>

<button
  class="w-full max-w-sm bg-transparent hover:bg-base-100/60 transition-all duration-200 ease-in-out border-none cursor-pointer rounded-2xl p-0 shadow-none group"
  on:click={openLiveRoomTable}
  aria-label="View match details"
>
  <div class="flex flex-col items-center gap-2 w-full text-sm">
    <div class="flex flex-row justify-between w-full text-center items-center gap-2">
      <div class="flex flex-col flex-1 px-2 gap-1 items-center">
        {#each team0 as player}
          <div class="flex flex-col items-center">
            <img src={getAvatar(player.username)} alt={player.username} class="w-8 h-8 rounded-full border-2 border-primary/40 shadow-md mb-1" loading="lazy" />
            <p class="whitespace-nowrap overflow-hidden text-ellipsis w-full text-center font-semibold text-base-content/90" title={player.username}>
              {player.username}
            </p>
          </div>
        {/each}
        {#if team0.length > 0}
          <p class="text-center font-bold mt-1 text-success">{team0[0].lps} LP</p>
        {/if}
      </div>
      <div class="flex flex-col items-center justify-center gap-1 min-w-[70px]">
        <div class="flex flex-row items-center gap-1 text-base-content/80">
          <span class="text-xs font-bold">{room.players[0].score}</span>
          <span class="font-bold text-lg">vs</span>
          <span class="text-xs font-bold">{room.players[1].score}</span>
        </div>
        <span class="text-xs text-info font-bold">Turn {room.turn}</span>
        <span class="text-xs text-primary font-semibold">Best of {room.bestOf}</span>
        <span class="text-xs text-secondary font-semibold">{room.banList.name}</span>
      </div>
      <div class="flex flex-col flex-1 px-2 gap-1 items-center">
        {#each team1 as player}
          <div class="flex flex-col items-center">
            <img src={getAvatar(player.username)} alt={player.username} class="w-8 h-8 rounded-full border-2 border-primary/40 shadow-md mb-1" loading="lazy" />
            <p class="whitespace-nowrap overflow-hidden text-ellipsis w-full text-center font-semibold text-base-content/90" title={player.username}>
              {player.username}
            </p>
          </div>
        {/each}
        {#if team1.length > 0}
          <p class="text-center font-bold mt-1 text-success">{team1[0].lps} LP</p>
        {/if}
      </div>
    </div>
    <div class="flex flex-row justify-between w-full mt-2 px-2">
      <span class="text-xs text-gray-400 truncate max-w-[60%]" title={room.notes}>{room.notes}</span>
    </div>
  </div>
</button>

<!-- TODO: Move to a separate component -->
<dialog id="match-card-dialog" class="modal">
	<div class='overflow-x-auto mt-2 w-full max-w-6xl bg-base-300 border-2 border-base-100 overflow-y-auto max-h-[90vh]'>
		<h3 class="font-bold text-lg bg-base-300 p-4">Live Rooms ({$roomsStore.length})</h3>
		<table class='table table-zebra bg-base-300'>
			<thead class="sticky top-0 bg-base-300">
				<tr>
					<th class='max-w-[75px]'>Best of</th>
					<th class='min-w-[75px]'>Banlist</th>
					<th class='text-center'>Player 1</th>
					<th class='text-center'></th>
					<th class='text-center'>VS</th>
					<th class='text-center'></th>
					<th class='text-center'>Player 2</th>
					<th>Notes</th>
				</tr>
			</thead>
			<tbody>
					{#each $roomsStore as room (room.id)}
						<tr>
							<td class='text-center'>{room.bestOf}</td>
							<td>{room.banList.name}</td>
							<td class='text-center'>
								{#each room.players as player}
									{#if player.team === 0}
										<p>{player.username}</p>
									{/if}
								{/each}
							</td>
							<td class='text-center text-lg'>
								{room.players.find((p) => p.team === 0)?.lps}
							</td>
							<td class='text-center'>
								<p class="text-sm mt-1">{room.players.find((p) => p.team === 0)?.score} - {room.players.find((p) => p.team === 1)?.score}</p>
								<p class="text-xs mt-1 text-base-content">{room.turn}</p>
							</td>
							<td class='text-center text-lg'>
								{room.players.find((p) => p.team === 1)?.lps}
							</td>
							<td class='text-center'>
								{#each room.players as player}
									{#if player.team === 1}
										<p>{player.username}</p>
									{/if}
								{/each}
							</td>
							<td>{room.notes}</td>
						</tr>
					{/each}
			</tbody>
		</table>
		<div class="flex justify-center my-4 sticky bottom-0 bg-base-300">
			<button class="btn btn-sm btn-primary" on:click={closeDialog}>Close</button>
		</div>
	</div>
</dialog>
