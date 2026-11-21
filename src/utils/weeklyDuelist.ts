import type { Duelist } from '@types';

export type WeeklyDuelist = {
	duelist: Duelist;
	from: string;
	to: string;
};

// The API sends the weekly counts as strings; anything that is not a finite number becomes 0.
const toCount = (value: unknown) => {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
};

export const parseWeeklyDuelist = (payload: unknown): WeeklyDuelist | null => {
	if (!Array.isArray(payload) || payload.length === 0) return null;
	const item = payload[0] as Record<string, unknown> | null;
	if (!item || typeof item.userId !== 'string' || typeof item.username !== 'string') return null;

	const wins = toCount(item.wins);
	const losses = toCount(item.losses);
	const games = wins + losses;

	return {
		duelist: {
			userId: item.userId,
			username: item.username,
			points: toCount(item.points),
			wins,
			losses,
			winRate: games > 0 ? (wins / games) * 100 : null,
			position: 0,
		},
		from: String(item.from ?? ''),
		to: String(item.to ?? ''),
	};
};

const formatDay = (iso: string) =>
	new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

export const formatWeekRange = (from: string, to: string) => `${formatDay(from)} – ${formatDay(to)}`;
