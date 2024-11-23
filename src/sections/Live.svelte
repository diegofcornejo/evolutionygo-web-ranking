<script>
	import Marquee from 'svelte-fast-marquee';
	import MatchCard from '@components/Cards/MatchCard.svelte';
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
		{#each Array.from({ length: 10 }) as _, index}
			<MatchCard/>
		{/each}
	</div>
</Marquee>
