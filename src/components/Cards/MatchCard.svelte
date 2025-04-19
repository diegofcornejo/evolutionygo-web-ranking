<script lang="ts">
  import type { Room } from 'src/types/Room';

  export let room: Room;

  let team0 = [];
  let team1 = [];

  $: team0 = room.players.filter((p) => p.team === 0);
  $: team1 = room.players.filter((p) => p.team === 1);
</script>

<div
  class="card w-full max-w-sm hover:bg-neutral transition-all duration-200 ease-in-out border-2 border-transparent"
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
</div>
