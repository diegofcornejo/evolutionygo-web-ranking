import { useState, useMemo } from 'react';
import type { Match } from '@types';

interface MatchHistoryProps {
	matches: Match[];
}

type ResultFilterType = 'all' | 'wins' | 'losses';
type MatchTypeFilter = 'all' | 'pvp' | 'tag';

const getResultFilterButtonClass = (filterType: ResultFilterType, isActive: boolean): string => {
	if (!isActive) return 'btn-ghost';
	const classMap: Record<ResultFilterType, string> = {
		wins: 'btn-success',
		losses: 'btn-error',
		all: 'btn-primary',
	};
	return classMap[filterType];
};

const getMatchTypeLabel = (filterType: MatchTypeFilter): string => {
	const labelMap: Record<MatchTypeFilter, string> = {
		pvp: 'PvP',
		tag: 'TAG',
		all: 'All Types',
	};
	return labelMap[filterType];
};

export default function MatchHistory({ matches }: Readonly<MatchHistoryProps>) {
	const [resultFilter, setResultFilter] = useState<ResultFilterType>('all');
	const [matchTypeFilter, setMatchTypeFilter] = useState<MatchTypeFilter>('all');
	const [searchTerm, setSearchTerm] = useState('');

	const getIsPvP = (match: Match) =>
		match.playerNames.length === 1 && match.opponentNames.length === 1;

	const getDuelMode = (match: Match) => {
		const mode = `${match.playerNames.length}v${match.opponentNames.length}`;
		return { mode, bestOf: `Bo${match.bestOf}` };
	};

	const localDateString = (date: string) => {
		const utcDate = new Date(date);
		return {
			date: utcDate.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			}),
			time: utcDate.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: true,
			}),
		};
	};

	const filteredMatches = useMemo(() => {
		return matches.filter((match) => {
			const matchesResultFilter =
				resultFilter === 'all' ||
				(resultFilter === 'wins' && match.winner) ||
				(resultFilter === 'losses' && !match.winner);

			const isPvP = getIsPvP(match);
			const matchesTypeFilter =
				matchTypeFilter === 'all' ||
				(matchTypeFilter === 'pvp' && isPvP) ||
				(matchTypeFilter === 'tag' && !isPvP);

			const opponentName = match.opponentNames.join(', ').toLowerCase();
			const matchesSearch = searchTerm === '' || opponentName.includes(searchTerm.toLowerCase());

			return matchesResultFilter && matchesTypeFilter && matchesSearch;
		});
	}, [matches, resultFilter, matchTypeFilter, searchTerm]);

	const resultFilterCounts = useMemo(() => ({
		all: matches.length,
		wins: matches.filter((m) => m.winner).length,
		losses: matches.filter((m) => !m.winner).length,
	}), [matches]);

	const matchTypeFilterCounts = useMemo(() => ({
		all: matches.length,
		pvp: matches.filter((m) => getIsPvP(m)).length,
		tag: matches.filter((m) => !getIsPvP(m)).length,
	}), [matches]);

	if (matches.length === 0) {
		return (
			<div className="bg-base-200/50 rounded-2xl p-8 text-center border border-base-300">
				<div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-base-300/60 flex items-center justify-center">
					<span className="text-sm font-semibold text-base-content/60">No Data</span>
				</div>
				<h3 className="text-xl font-semibold mb-2">No Matches Yet</h3>
				<p className="text-base-content/60">
					Start dueling to build your match history.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				<div className="flex flex-wrap gap-2 items-center">
					{/* Result Filter */}
					{(['all', 'wins', 'losses'] as const).map((filterType) => (
						<button
							key={filterType}
							type="button"
							onClick={() => setResultFilter(filterType)}
							className={`btn btn-sm ${getResultFilterButtonClass(filterType, resultFilter === filterType)}`}
						>
							{filterType.charAt(0).toUpperCase() + filterType.slice(1)}
							<span className="badge badge-sm badge-ghost ml-1">
								{resultFilterCounts[filterType]}
							</span>
						</button>
					))}

					{/* Separator */}
					<div className="w-px h-6 bg-base-300 mx-1 hidden sm:block" />

					{/* Match Type Filter */}
					{(['all', 'pvp', 'tag'] as const).map((filterType) => (
						<button
							key={`type-${filterType}`}
							type="button"
							onClick={() => setMatchTypeFilter(filterType)}
							className={`btn btn-sm ${
								matchTypeFilter === filterType ? 'btn-neutral' : 'btn-ghost'
							}`}
						>
							{getMatchTypeLabel(filterType)}
							<span className="badge badge-sm badge-ghost ml-1">
								{matchTypeFilterCounts[filterType]}
							</span>
						</button>
					))}
				</div>

				<div className="relative w-full sm:w-64">
					<input
						type="text"
						placeholder="Search opponent..."
						className="input input-bordered input-sm w-full pr-10"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<svg
						className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
			</div>

			{/* Match Cards - Mobile Optimized */}
			<div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
				{filteredMatches.map((match, index) => {
					const { mode, bestOf } = getDuelMode(match);
					const { date, time } = localDateString(match.date);
					const isWin = match.winner;

					return (
						<div
							key={`${match.date}-${index}`}
							className={`relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg ${
								isWin
									? 'bg-success/5 border-success/20 hover:border-success/40'
									: 'bg-error/5 border-error/20 hover:border-error/40'
							}`}
						>
							{/* Result indicator bar */}
							<div
								className={`absolute left-0 top-0 bottom-0 w-1 ${
									isWin ? 'bg-success' : 'bg-error'
								}`}
							/>

							<div className="p-4 pl-5">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
									{/* Main info */}
									<div className="flex items-center gap-4">
										{/* Result badge */}
										<div
											className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
												isWin ? 'bg-success/20' : 'bg-error/20'
											}`}
										>
											<span className={`text-lg font-bold ${isWin ? 'text-success' : 'text-error'}`}>
												{match.playerScore}-{match.opponentScore}
											</span>
										</div>

										{/* Match details */}
										<div>
											<div className="flex items-center gap-2 flex-wrap">
												<span className="font-semibold">
													{match.playerNames.join(', ')} <span className="text-warning"> vs </span> {match.opponentNames.join(', ')}
												</span>
												{!getIsPvP(match) && (
													<span className="badge badge-xs badge-ghost">TAG</span>
												)}
											</div>
											<div className="flex items-center gap-2 mt-1 text-sm text-base-content/60">
												<span>{match.banListName}</span>
												<span>•</span>
												<span>{mode}</span>
												<span>•</span>
												<span>{bestOf}</span>
											</div>
										</div>
									</div>

									{/* Points and date */}
									<div className="flex items-center gap-4 sm:gap-6 pl-16 sm:pl-0">
										<div className="text-right">
											<div
												className={`font-bold ${
													isWin ? 'text-success' : 'text-error'
												}`}
											>
												{isWin ? '+' : ''}{match.points} pts
											</div>
											<div className="text-xs text-base-content/50">
												Season {match.season}
											</div>
										</div>
										<div className="text-right text-sm text-base-content/60">
											<div>{date}</div>
											<div className="text-xs">{time}</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{filteredMatches.length === 0 && (
				<div className="text-center py-8 text-base-content/60">
					No matches found with the current filters.
				</div>
			)}
		</div>
	);
}
