import Rating from '@components/Rating';

export default () => {
	const rating = 1 + (50 / 100) * 4;
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
	}
	return (
		<div className="card w-full max-w-sm hover:bg-neutral transition-all duration-200 ease-in-out border-2 border-transparent">
			<div className="flex flex-col items-center gap-2 m-4 text-sm">
				<div className="flex flex-row items-center justify-center gap-2">
					<div className="text-right">
						<p>{match.duelist1.username} [ {match.duelist1.score} ]</p>
						<p>{match.duelist1.points}</p>
					</div>
					<div className="flex flex-col items-center">
						<p>vs</p>
						<p>{match.turn}</p>
					</div>
					<div className="text-left">
						<p>[ {match.duelist2.score} ] {match.duelist2.username}</p>
						<p>{match.duelist2.points}</p>
					</div>
				</div>
			</div>
		</div>

	)
}
