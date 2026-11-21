<script>
  import { onDestroy, onMount } from 'svelte';
  import Marquee from 'svelte-fast-marquee';
  import MatchCard from '@components/Cards/MatchCard.svelte';
  import LiveRoomsDialog from '@components/LiveRoomsDialog.svelte';
  import { roomsStore } from '../stores/rooms/roomsStore';
  import { startWatchRoomsPolling } from '@stores/watch/watch-actions';

  // The WebSocket rooms feed carries no admission data, so the rooms listing is
  // what tells us which of these duels a visitor is allowed to spectate.
  let stopPolling;

  onMount(() => {
    stopPolling = startWatchRoomsPolling(15000);
  });

  onDestroy(() => {
    stopPolling?.();
  });
</script>

<Marquee
  class="bg-base-100"
  gradientColor="rgba(142,69,235, 0.5)"
  gradientWidth=8%
  speed=50
  pauseOnHover
>
  <div class="flex gap-3 py-3 pr-3">
    {#each $roomsStore as room (room.id)}
      <MatchCard {room} />
    {/each}
  </div>
</Marquee>

<LiveRoomsDialog />
