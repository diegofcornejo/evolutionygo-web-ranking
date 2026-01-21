import Rating from '@components/Rating';

interface ProfileHeaderProps {
	userId: string;
	username: string;
	points: number;
	wins: number;
	losses: number;
	winRate: number;
	position: number;
	season: string;
	banlistName: string;
	seasonStats?: SeasonStat[];
}

interface SeasonStat {
	season: number;
	points: number;
	wins: number;
	losses: number;
}

export default function ProfileHeader({
	username,
	points,
	wins,
	losses,
	winRate,
	position,
	season,
	banlistName,
	seasonStats,
}: Readonly<ProfileHeaderProps>) {
	const image = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&size=256`;
	const rating = 1 + (winRate / 100) * 4;
	const totalGames = wins + losses;
	const normalizedPosition = Number(position) || 0;
	const chartWidth = 240;
	const chartHeight = 28;
	const orderedSeasons = [...(seasonStats ?? [])].sort((a, b) => b.season - a.season);
	const hasChartData = orderedSeasons.length > 1;
	const series = {
		points: orderedSeasons.map((stat) => stat.points),
		wins: orderedSeasons.map((stat) => stat.wins),
		losses: orderedSeasons.map((stat) => stat.losses),
		totalGames: orderedSeasons.map((stat) => stat.wins + stat.losses),
	};

	const getLinePath = (values: number[]) => {
		if (!values.length) return '';
		const safeMax = Math.max(...values, 1);
		const step = values.length > 1 ? chartWidth / (values.length - 1) : 0;

		return values
			.map((value, index) => {
				const x = values.length > 1 ? index * step : chartWidth / 2;
				const y = chartHeight - (value / safeMax) * chartHeight;
				return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
			})
			.join(' ');
	};

	const getPoints = (values: number[]) => {
		if (!values.length) return [];
		const safeMax = Math.max(...values, 1);
		const step = values.length > 1 ? chartWidth / (values.length - 1) : 0;

		return values.map((value, index) => ({
			x: values.length > 1 ? index * step : chartWidth / 2,
			y: chartHeight - (value / safeMax) * chartHeight,
			season: orderedSeasons[index]?.season ?? 0,
			value,
		}));
	};

	const renderSparkline = (values: number[], className: string) => {
		if (!hasChartData) return null;
		return (
			<svg
				viewBox={`0 0 ${chartWidth} ${chartHeight}`}
				className={`block w-full h-7 overflow-visible ${className}`}
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<path
					d={getLinePath(values)}
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinejoin="round"
					strokeLinecap="round"
				/>
				{getPoints(values).map((point) => (
					<g key={point.season} className="group pointer-events-auto">
						<circle
							cx={point.x}
							cy={point.y}
							r={3.5}
							fill="currentColor"
							className="cursor-pointer"
						>
							<title>{`Season ${point.season}: ${point.value}`}</title>
						</circle>
						<text
							x={point.x + 4}
							y={point.y - 4}
							className="text-[10px] fill-current opacity-0 transition-opacity duration-150 group-hover:opacity-100"
							textAnchor="start"
							pointerEvents="none"
						>
							{`S${point.season}: ${point.value}`}
						</text>
					</g>
				))}
			</svg>
		);
	};

	const getRankBadge = () => {
		if (normalizedPosition === 1) return { label: 'Champion', color: 'badge-warning', icon: 'ic:round-emoji-events' };
		if (normalizedPosition === 2) return { label: '2nd Place', color: 'badge-secondary', icon: 'ic:round-star' };
		if (normalizedPosition === 3) return { label: '3rd Place', color: 'badge-accent', icon: 'ic:round-star-half' };
		if (normalizedPosition <= 10) return { label: 'Top 10', color: 'badge-primary', icon: 'ic:round-trending-up' };
		if (normalizedPosition <= 20) return { label: 'Top 20', color: 'badge-info', icon: 'ic:round-leaderboard' };
		return null;
	};

	const rankBadge = getRankBadge();

	const getBorderGradient = () => {
		if (normalizedPosition === 1) return 'from-yellow-400 via-yellow-500 to-yellow-600';
		if (normalizedPosition === 2) return 'from-gray-300 via-gray-400 to-gray-500';
		if (normalizedPosition === 3) return 'from-orange-400 via-orange-500 to-orange-600';
		return 'from-primary via-secondary to-accent';
	};

	return (
		<div className="relative">
			{/* Background decoration */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-3xl" />
			
			<div className="relative bg-base-200/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-base-300">
				<div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
					{/* Avatar Section */}
					<div className="relative group">
						<div className={`absolute -inset-1 bg-gradient-to-r ${getBorderGradient()} rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500`} />
						<div className="relative">
							<img
								src={image}
								alt={username}
								className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-base-100"
								loading="lazy"
								decoding="async"
							/>
							{normalizedPosition > 0 && normalizedPosition <= 3 && (
								<div className="absolute -bottom-2 -right-2 w-12 h-12 bg-base-100 rounded-full flex items-center justify-center shadow-lg">
									<span className="text-lg font-bold text-base-content">
										{normalizedPosition}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* User Info Section */}
					<div className="flex-1 text-center lg:text-left">
						<div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
							<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
								{username}
							</h1>
							{rankBadge && (
								<span className={`badge ${rankBadge.color} badge-lg gap-1 self-center`}>
									{rankBadge.label}
								</span>
							)}
						</div>

						<div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
							<span className="badge badge-outline badge-lg">Season {season}</span>
							<span className="badge badge-outline badge-lg">{banlistName || 'Global'}</span>
							<span className="badge badge-ghost badge-lg">Rank #{normalizedPosition || '-'}</span>
						</div>

						<div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
							<Rating rating={rating} size="lg" />
							<span className="text-sm text-base-content/60">({winRate.toFixed(1)}% win rate)</span>
						</div>

						{/* Quick Stats */}
						<div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4">
						<div className="stat bg-base-300/50 rounded-xl p-4 min-w-[120px]">
							<div className="stat-title text-xs">Points</div>
							<div className="flex items-center gap-3">
								<div className="stat-value text-2xl text-warning w-16 shrink-0">{points.toLocaleString()}</div>
								<div className="flex-1">{renderSparkline(series.points, 'text-warning')}</div>
							</div>
						</div>
						<div className="stat bg-base-300/50 rounded-xl p-4 min-w-[120px]">
							<div className="stat-title text-xs">Wins</div>
							<div className="flex items-center gap-3">
								<div className="stat-value text-2xl text-success w-16 shrink-0">{wins}</div>
								<div className="flex-1">{renderSparkline(series.wins, 'text-success')}</div>
							</div>
						</div>
						<div className="stat bg-base-300/50 rounded-xl p-4 min-w-[120px]">
							<div className="stat-title text-xs">Losses</div>
							<div className="flex items-center gap-3">
								<div className="stat-value text-2xl text-error w-16 shrink-0">{losses}</div>
								<div className="flex-1">{renderSparkline(series.losses, 'text-error')}</div>
							</div>
						</div>
						<div className="stat bg-base-300/50 rounded-xl p-4 min-w-[120px]">
							<div className="stat-title text-xs">Total Games</div>
							<div className="flex items-center gap-3">
								<div className="stat-value text-2xl text-info w-16 shrink-0">{totalGames}</div>
								<div className="flex-1">{renderSparkline(series.totalGames, 'text-info')}</div>
							</div>
						</div>
					</div>
				</div>
				</div>
			</div>
		</div>
	);
}
