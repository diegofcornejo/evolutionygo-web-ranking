<script>

	const match = {
			turn: 4,
			duelist1: {
					username: 'Metalwarrior',
					points: 8000,
					score: 2
			},
			duelist2: {
					username: 'Randomtechguy',
					points: 5500,
					score: 1
			}
	};
</script>

<div class="card w-full max-w-sm hover:bg-neutral transition-all duration-200 ease-in-out border-2 border-transparent">
	<div class="flex flex-col items-center gap-2 m-4 text-sm">
			<div class="flex flex-row items-center justify-center gap-2">
					<div class="text-right">
							<p>{match.duelist1.username} [ {match.duelist1.score} ]</p>
							<p>{match.duelist1.points}</p>
					</div>
					<div class="flex flex-col items-center">
							<p>vs</p>
							<p>{match.turn}</p>
					</div>
					<div class="text-left">
							<p>[ {match.duelist2.score} ] {match.duelist2.username}</p>
							<p>{match.duelist2.points}</p>
					</div>
			</div>
	</div>
</div>
