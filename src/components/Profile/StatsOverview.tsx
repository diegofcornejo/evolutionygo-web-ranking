interface StatsOverviewProps {
	wins: number;
	losses: number;
	winRate: number;
	points: number;
	position: number;
}

interface RankingStyle {
	description: string;
	color: string;
	bgColor: string;
	progressColor: string;
}

const getRankingStyle = (position: number): RankingStyle => {
	if (position <= 3) {
		return {
			description: 'Top 3 Player',
			color: 'text-warning',
			bgColor: 'bg-warning/10',
			progressColor: 'bg-warning',
		};
	}
	if (position <= 10) {
		return {
			description: 'Top 10 Player',
			color: 'text-primary',
			bgColor: 'bg-primary/10',
			progressColor: 'bg-primary',
		};
	}
	if (position <= 20) {
		return {
			description: 'Top 20 Player',
			color: 'text-info',
			bgColor: 'bg-info/10',
			progressColor: 'bg-info',
		};
	}
	return {
		description: 'Ranked Player',
		color: 'text-info',
		bgColor: 'bg-info/10',
		progressColor: 'bg-info',
	};
};

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

	const averagePointsPerGame = totalGames > 0 ? (points / totalGames) : 0;
	const averagePointsLabel = totalGames > 0 ? `${averagePointsPerGame.toFixed(1)} per game` : '— per game';

	const rankingStyle = getRankingStyle(normalizedPosition);

	const stats = [
		{
			label: 'Ranking',
			value: normalizedPosition > 0 ? `#${normalizedPosition}` : '-',
			description: rankingStyle.description,
			color: rankingStyle.color,
			bgColor: rankingStyle.bgColor,
			progress: Math.max(100 - (normalizedPosition / 100) * 100, 10),
			progressColor: rankingStyle.progressColor,
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
