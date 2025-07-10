<script lang="ts">
  import type { Room } from 'src/types/Room';
	import { roomsStore } from '@stores/rooms/roomsStore';

  export let room: Room;

  let team0 = [];
  let team1 = [];

  $: team0 = room.players.filter((p) => p.team === 0);
  $: team1 = room.players.filter((p) => p.team === 1);

	$: uniqueUsersOnlineCount = new Set($roomsStore.flatMap(room => room.players.map(p => p.username))).size;

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
  class="card w-full max-w-sm hover:bg-neutral transition-all duration-200 ease-in-out border-2 border-transparent cursor-pointer"
  on:click={openLiveRoomTable}
>
  <div class="flex flex-col items-center gap-2 m-4 text-sm">
    <div class="flex flex-row justify-between w-full text-center">
      <div class="flex flex-col flex-1 px-2 gap-1">
        {#each team0 as player}
          <p
            class="whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
            title={player.username}
          >
            {player.username}
          </p>
        {/each}
        {#if team0.length > 0}
          <p class="text-center font-semibold mt-1">{team0[0].lps}</p>
        {/if}
      </div>

      <div class="w-16 flex flex-col items-center justify-center">
        <div class="flex flex-row items-center gap-1">
          <span class="text-xs">{room.players[0].score}</span>
          <p class="font-semibold">vs</p>
          <span class="text-xs">{room.players[1].score}</span>
        </div>
        <p>{room.turn}</p>
      </div>

      <div class="flex flex-col flex-1 px-2 gap-1">
        {#each team1 as player}
          <p
            class="whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
            title={player.username}
          >
            {player.username}
          </p>
        {/each}
        {#if team1.length > 0}
          <p class="text-center font-semibold mt-1">{team1[0].lps}</p>
        {/if}
      </div>
    </div>
  </div>
</button>

<!-- TODO: Move to a separate component -->
<dialog id="match-card-dialog" class="modal">
	<div class='overflow-x-auto mt-2 w-full max-w-6xl bg-base-300 border-2 border-base-100 overflow-y-auto max-h-[90vh]'>
		<h3 class="font-bold text-lg bg-base-300 p-4">Live Rooms ({$roomsStore.length}) · Players Online ({uniqueUsersOnlineCount})</h3>
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
							<td class='text-center min-w-[75px]'>
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
