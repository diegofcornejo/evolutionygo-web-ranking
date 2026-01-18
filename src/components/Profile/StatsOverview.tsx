interface StatsOverviewProps {
	wins: number;
	losses: number;
	winRate: number;
	points: number;
	position: number;
}

export default function StatsOverview({
	wins,
	losses,
	winRate,
	points,
	position,
}: Readonly<StatsOverviewProps>) {
	const totalGames = wins + losses;
	const winPercentage = totalGames > 0 ? (wins / totalGames) * 100 : 0;
	const normalizedPosition = Number(position) || 0;

	// Calculate streak and other derived stats
	const averagePointsPerGame = totalGames > 0 ? (points / totalGames) : 0;
	const averagePointsLabel = totalGames > 0 ? `${averagePointsPerGame.toFixed(1)} per game` : '— per game';

	const stats = [
		{
			label: 'Ranking',
			value: normalizedPosition > 0 ? `#${normalizedPosition}` : '-',
			description: normalizedPosition <= 10 ? 'Top 10 Player' : normalizedPosition <= 20 ? 'Top 20 Player' : 'Ranked Player',
			color: normalizedPosition <= 3 ? 'text-warning' : normalizedPosition <= 10 ? 'text-primary' : 'text-info',
			bgColor: normalizedPosition <= 3 ? 'bg-warning/10' : normalizedPosition <= 10 ? 'bg-primary/10' : 'bg-info/10',
			progress: Math.max(100 - (normalizedPosition / 100) * 100, 10),
			progressColor: normalizedPosition <= 3 ? 'bg-warning' : normalizedPosition <= 10 ? 'bg-primary' : 'bg-info',
		},
		{
			label: 'Win Rate',
			value: `${winRate.toFixed(1)}%`,
			description: `${wins}W - ${losses}L`,
			color: 'text-success',
			bgColor: 'bg-success/10',
			progress: winPercentage,
			progressColor: 'bg-success',
		},
		{
			label: 'Total Points',
			value: points.toLocaleString(),
			description: averagePointsLabel,
			color: 'text-warning',
			bgColor: 'bg-warning/10',
			progress: Math.min((points / 5000) * 100, 100),
			progressColor: 'bg-warning',
		},
		{
			label: 'Games Played',
			value: totalGames.toString(),
			description: 'Ranked matches',
			color: 'text-info',
			bgColor: 'bg-info/10',
			progress: Math.min((totalGames / 100) * 100, 100),
			progressColor: 'bg-info',
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{stats.map((stat) => (
				<div
					key={stat.label}
					className={`${stat.bgColor} rounded-2xl p-5 border border-base-300 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5`}
				>
					<div className="flex items-start justify-between mb-3">
						<span className="text-sm text-base-content/60 font-medium">{stat.label}</span>
					</div>
					<div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
					<div className="text-xs text-base-content/50 mb-3">{stat.description}</div>
					<div className="w-full bg-base-300/50 rounded-full h-1.5">
						<div
							className={`${stat.progressColor} h-1.5 rounded-full transition-all duration-500`}
							style={{ width: `${stat.progress}%` }}
						/>
					</div>
				</div>
			))}
		</div>
	);
}
