// The API sends winRate as null for players with no wins and no losses.
const toNumber = (winRate: number | null | undefined): number | null =>
	typeof winRate === 'number' && Number.isFinite(winRate) ? winRate : null;

export const formatWinRate = (winRate: number | null | undefined, digits = 2): string => {
	const value = toNumber(winRate);
	return value === null ? '—' : `${value.toFixed(digits)}%`;
};

export const winRateStars = (winRate: number | null | undefined): number =>
	1 + ((toNumber(winRate) ?? 0) / 100) * 4;
