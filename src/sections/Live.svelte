<script>
  import Marquee from 'svelte-fast-marquee';
  import MatchCard from '@components/Cards/MatchCard.svelte';
  import { roomsStore } from '../stores/rooms/roomsStore';
</script>

<Marquee
  class="bg-base-100"
  gradientColor="rgba(142,69,235, 0.5)"
  gradientWidth=8%
  speed=50
  pauseOnHover
>
  <div class="flex gap-2">
    {#each $roomsStore as room (room.id)}
      <MatchCard {room} />
    {/each}
  </div>
</Marquee>
