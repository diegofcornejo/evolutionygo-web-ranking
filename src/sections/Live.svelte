<script>
  import Marquee from 'svelte-fast-marquee';
  import MatchCard from '@components/Cards/MatchCard.svelte';
  import { roomsStore } from '../stores/rooms/roomsStore';
</script>

<Marquee
  class="bg-base-300"
  gradient={true}
  --gradientColor={'rgba(142,69,235, 0.5)'}
  --gradientWidth={'50px'}
  speed={50}
  pauseOnHover={true}
  autoFill={true}
>
  <div class="flex gap-2">
    {#each $roomsStore as room (room.id)}
      <MatchCard {room} />
    {/each}
  </div>
</Marquee>
