<script>
  import Marquee from 'svelte-fast-marquee';
  import MatchCard from '@components/Cards/MatchCard.svelte';
  import { roomsStore } from '../stores/rooms/roomsStore';
</script>

<Marquee
  class="bg-base-300 py-2 shadow-lg border-b-2 border-primary/40"
  gradient={true}
  --gradientColor={'rgba(142,69,235, 0.5)'}
  --gradientWidth={'50px'}
  speed={50}
  pauseOnHover={true}
  autoFill={true}
>
  <div class="flex gap-6 px-2">
    {#each $roomsStore as room (room.id)}
      <div class="relative bg-gradient-to-br from-primary/10 via-base-200/80 to-secondary/10 rounded-2xl shadow-2xl border-2 border-primary/40 min-w-[280px] max-w-xs p-2 flex items-center transition-transform duration-200 hover:scale-105 hover:shadow-3xl mx-1">
        <div class="absolute left-2 top-2 z-20 pointer-events-none select-none flex flex-col items-start">
          <span class="flex items-center gap-2 mb-1">
            <svg class="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg>
            <span class="text-xs font-extrabold text-white bg-red-500 px-2 py-0.5 rounded-full shadow-lg tracking-widest uppercase animate-pulse">LIVE</span>
          </span>
        </div>
        <div class="pt-7 w-full"> <!-- padding top para dejar espacio al mensaje LIVE -->
          <MatchCard {room} class="bg-transparent shadow-none border-none p-0 m-0 w-full" />
        </div>
      </div>
    {/each}
  </div>
</Marquee>
