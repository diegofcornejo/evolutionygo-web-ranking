import { useRef } from 'react';
import type { PointerEvent } from 'react';
import type { Duelist } from '@types';
import { cardLevel } from '@utils/tier';
import { formatWinRate } from '@utils/winRate';
import { usePrefersReducedMotion } from '@utils/usePrefersReducedMotion';
import { formatWeekRange } from '@utils/weeklyDuelist';
import TierEmblem from '@components/TierEmblem';

type Place = 1 | 2 | 3;

interface Props extends Duelist {
	banListName: string;
	season: string;
	place: Place;
	featured?: boolean;
	showElo: boolean;
	/** Turns the card into the global, weekly "Duelist of the week" card: holo frame, ribbon, week range. */
	weekly?: { from: string; to: string };
}

// Our own frame, in the spirit of a trading card: gold, silver and bronze by place.
const FRAMES: Record<Place, string> = {
	1: 'from-[#fde68a] via-[#a16207] to-[#3b2306]',
	2: 'from-[#f1f5f9] via-[#64748b] to-[#1e2530]',
	3: 'from-[#fdba74] via-[#9a3412] to-[#2a1208]',
};

const BADGE_RING: Record<Place, string> = {
	1: 'border-[#fde68a]',
	2: 'border-[#e2e8f0]',
	3: 'border-[#fdba74]',
};

// The weekly card is global and does not follow the filters, so it gets its own holographic frame.
const WEEKLY_FRAME = 'bg-[conic-gradient(from_200deg,#22d3ee,#a78bfa,#f472b6,#facc15,#22d3ee)]';

const MAX_TILT_DEG = 8;

const initials = (username: string) => username.replace(/\s*\(You\)$/, '').replace(/\s+/g, '').slice(0, 2).toUpperCase();

export default function DuelistTradingCard({
	userId,
	username,
	points,
	wins,
	losses,
	winRate,
	rating,
	provisional,
	tier,
	banListName,
	season,
	place,
	featured = false,
	showElo,
	weekly,
}: Readonly<Props>) {
	const cardRef = useRef<HTMLAnchorElement>(null);
	const reduceMotion = usePrefersReducedMotion();
	const level = cardLevel({ tier, winRate });
	const typeLine = weekly ? `[${formatWeekRange(weekly.from, weekly.to)}]` : tier ? `[Duelist / ${tier.name}]` : '[Duelist]';
	const frame = weekly ? WEEKLY_FRAME : `bg-gradient-to-br ${FRAMES[place]}`;

	const setTilt = (x: number, y: number) => {
		cardRef.current?.style.setProperty('--tilt-x', `${x}deg`);
		cardRef.current?.style.setProperty('--tilt-y', `${y}deg`);
	};

	const onPointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
		if (reduceMotion || event.pointerType !== 'mouse') return;
		const rect = event.currentTarget.getBoundingClientRect();
		if (!rect.width || !rect.height) return;
		const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
		const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
		setTilt(-offsetY * 2 * MAX_TILT_DEG, offsetX * 2 * MAX_TILT_DEG);
	};

	const onPointerLeave = () => setTilt(0, 0);

	return (
		<a
			ref={cardRef}
			href={`/duelists/${userId}/${encodeURIComponent(banListName)}?username=${encodeURIComponent(username)}&season=${season}`}
			{...(weekly ? { 'data-weekly': '' } : { 'data-place': place })}
			data-tilt={reduceMotion ? 'off' : 'on'}
			onPointerMove={onPointerMove}
			onPointerLeave={onPointerLeave}
			className={`group relative grid aspect-[59/86] w-full grid-cols-1 rounded-xl ${frame} p-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] outline-offset-4 transition-transform duration-200 ease-out [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transition-none`}
		>
			{weekly ? (
				<span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-300 bg-cyan-900 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-cyan-50 shadow-lg sm:text-xs">
					DUELIST OF THE WEEK
				</span>
			) : (
				<span
					aria-label={`Rank ${place}`}
					className={`absolute -top-3 -left-3 z-10 grid h-9 w-9 place-items-center rounded-full border-2 ${BADGE_RING[place]} bg-base-300 text-base font-black text-white shadow-lg`}
				>
					{place}
				</span>
			)}
			<div className="flex flex-col gap-1.5 rounded-lg ring-1 ring-black/40">
				<div className="flex items-center justify-between gap-2 rounded-md bg-black/55 px-2.5 py-1.5">
					<span title={username} className={`truncate font-extrabold text-white ${featured ? 'text-lg' : 'text-sm sm:text-base'}`}>
						{username}
					</span>
					{tier ? (
						<TierEmblem tier={tier.id} className="h-7 w-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" size={28} />
					) : (
						<span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/40 bg-black/60 text-xs text-amber-200">
							★
						</span>
					)}
				</div>
				<div role="img" aria-label={`Level ${level}`} className="flex justify-end gap-0.5 px-1 text-xs leading-none text-amber-300 sm:text-sm">
					{'★'.repeat(level)}
				</div>
				<div className="relative min-h-12 flex-1 overflow-hidden rounded-md border-2 border-black/60 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.32),transparent_58%),linear-gradient(160deg,#2b1250,#14203f)]">
					<span
						aria-hidden="true"
						data-initials
						className={`absolute inset-0 grid place-items-center font-black text-white [text-shadow:0_3px_12px_rgba(0,0,0,0.65)] ${featured ? 'text-6xl sm:text-7xl' : 'text-4xl sm:text-5xl'}`}
					>
						{initials(username)}
					</span>
					<span
						data-foil
						{...(featured && !reduceMotion ? { 'data-foil-animated': '' } : {})}
						aria-hidden="true"
						className={`pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.4)_46%,rgba(140,210,255,0.3)_52%,transparent_66%)] bg-[length:250%_100%] mix-blend-screen transition-opacity duration-300 ${
							featured && !reduceMotion ? 'animate-foil opacity-100' : 'opacity-0 group-hover:opacity-100 motion-reduce:hidden'
						}`}
					/>
				</div>
				<p className="rounded bg-black/45 px-2 py-0.5 text-[11px] font-bold text-white sm:text-xs">{typeLine}</p>
				<div className="rounded-md bg-[#f3ead7] px-2.5 py-2 text-[#2a2014]">
					<p className="text-xs leading-snug sm:text-sm">
						{wins} wins · {losses} losses · {formatWinRate(winRate, 1)} win rate
					</p>
					<div className="mt-1.5 flex flex-wrap items-center justify-end gap-x-3 gap-y-0.5 border-t border-[#2a2014]/50 pt-1 text-xs font-extrabold sm:text-sm">
						<span>PTS/{points}</span>
						{weekly ? null : showElo ? (
							<span className="flex items-center gap-1">
								<span>ELO/{rating == null ? '—' : Math.round(rating)}</span>
								{provisional && rating != null ? (
									<span className="badge badge-xs badge-warning" title="Provisional Elo — not enough duels yet">?</span>
								) : null}
							</span>
						) : (
							<span>WIN%/{formatWinRate(winRate, 0)}</span>
						)}
					</div>
				</div>
			</div>
		</a>
	);
}
