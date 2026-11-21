import type { DuelistRating, DuelistTier, RankedTier } from '@types';
import TierEmblem from '@components/TierEmblem';
import { tierProgressView } from '@utils/tier';
import type { TierProgressView } from '@utils/tier';

interface Props {
	/** The ratings[] entry for the banlist the profile shows, if any. */
	rating: DuelistRating | null;
	/** The player's other tiered ratings this season. */
	others: DuelistRating[];
	ladder: RankedTier[] | null;
	season: string;
	banListName: string;
	userId: string;
	username: string;
}

const RANK_POINTS_NOTE = 'Rank points decide your rank and are counted separately from ladder points.';

// What it takes to reach each step: Bronze needs the placement games, the absolute tiers need rank points.
function LadderLabel({ step, ladder }: Readonly<{ step: RankedTier; ladder: RankedTier[] }>) {
	if (step.kind === 'placement') return <>Start</>;
	if (step.kind === 'relative') return <>{step.size ? `Top ${step.size}` : ''}</>;
	if (step.threshold != null) {
		return (
			<>
				{step.threshold}
				<span className="sr-only"> rank pts</span>
			</>
		);
	}
	const placement = ladder.find((candidate) => candidate.kind === 'placement' && candidate.order === step.order - 1);
	return <>{placement?.minGames ? `${placement.minGames} games` : ''}</>;
}

const profileHref = (userId: string, banListName: string, username: string, season: string) =>
	`/duelists/${userId}/${encodeURIComponent(banListName)}?username=${encodeURIComponent(username)}&season=${season}`;

function Progress({ view }: Readonly<{ view: TierProgressView }>) {
	if (view.kind === 'top') {
		return <p className="mt-4 font-semibold text-base-content/80">{view.size ? `Top ${view.size} of the ladder` : 'Top of the ladder'}</p>;
	}
	if (view.kind === 'relative') {
		const rule = [view.size ? `top ${view.size}` : null, view.minGames ? `with ${view.minGames}+ games` : null].filter(Boolean).join(' ');
		return <p className="mt-4 font-semibold text-base-content/80">{rule ? `Next: ${view.nextName} · ${rule}` : `Next: ${view.nextName}`}</p>;
	}
	if (view.kind === 'none') return null;

	return (
		<div className="mt-4">
			<div
				role="progressbar"
				aria-label={`Progress to ${view.nextName}`}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={view.percent}
				aria-valuetext={
					view.kind === 'points' ? `${view.current} of ${view.target} rank points` : `${view.current} of ${view.target} placement games`
				}
				className="h-2.5 overflow-hidden rounded-full bg-base-content/10"
			>
				<div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${view.percent}%` }} />
			</div>
			<div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
				{view.kind === 'points' ? (
					<span className="flex items-baseline gap-2">
						<span className="flex items-center gap-1 text-base-content/60">
							Rank pts
							<span className="tooltip tooltip-right before:max-w-[min(16rem,60vw)]" data-tip={RANK_POINTS_NOTE}>
								<button
									type="button"
									aria-label={`About rank points: ${RANK_POINTS_NOTE}`}
									className="grid h-4 w-4 cursor-help place-items-center rounded-full border border-base-content/30 text-[10px] leading-none"
								>
									?
								</button>
							</span>
						</span>
						<span className="font-bold tabular-nums">{`${view.current} / ${view.target}`}</span>
					</span>
				) : (
					<span className="font-bold tabular-nums">{`Placement ${view.current} / ${view.target} games`}</span>
				)}
				<span className="text-base-content/60">
					{view.remaining === 0 && view.distinct && !view.distinct.met
						? `Points met · needs wins vs ${view.distinct.required} different opponents`
						: `${view.remaining} more to ${view.nextName}`}
				</span>
			</div>
		</div>
	);
}

/** The player's ranked tier on the selected banlist, with progress, the ladder and their other ranks. */
export default function RankCard({ rating, others, ladder, season, banListName, userId, username }: Readonly<Props>) {
	const tier = rating?.tier ?? null;
	const ranked = others.filter((other): other is DuelistRating & { tier: DuelistTier } => !!other.tier);
	// Not null: with both the React and Svelte renderers loaded, Astro cannot server-render a React
	// component that returns null and fails the whole profile page ("Unable to render RankCard").
	if (!tier && ranked.length === 0) return <></>;

	const view = tier ? tierProgressView(tier, ladder) : null;
	const elo = rating?.rating ?? tier?.rating;
	const peak = rating?.peak ?? tier?.peak;
	const currentOrder = tier ? ladder?.find((step) => step.id === tier.id)?.order : undefined;

	return (
		<section aria-label="Rank" data-rank-card className="rounded-3xl border border-base-300 bg-base-200/80 p-6">
			{tier && view ? (
				<>
					<div className="flex items-center gap-5">
						<TierEmblem tier={tier.id} className="h-20 w-20 drop-shadow-[0_8px_18px_rgba(124,58,237,0.35)]" />
						<div className="min-w-0">
							<p className="text-sm text-base-content/60">{`Season ${season} · ${banListName}`}</p>
							<h2 className="text-3xl font-extrabold leading-tight">{tier.name}</h2>
							{elo != null ? (
								<p className="text-sm text-base-content/60">
									{peak != null ? `Elo ${Math.round(elo)} · Peak ${Math.round(peak)}` : `Elo ${Math.round(elo)}`}
								</p>
							) : null}
						</div>
					</div>

					<Progress view={view} />

					{view.distinct ? (
						<div className="mt-3 flex flex-wrap gap-2">
							<span
								data-met={String(view.distinct.met)}
								className={`badge badge-outline gap-1 ${view.distinct.met ? 'badge-success' : 'text-base-content/70'}`}
							>
								{view.distinct.met ? <span aria-hidden="true">✓</span> : null}
								<span>{`Wins vs ${view.distinct.required} different opponents (${view.distinct.current})`}</span>
							</span>
						</div>
					) : null}

					{ladder && currentOrder != null ? (
						<ol
							aria-label="Rank ladder"
							className="mt-5 grid gap-1.5"
							style={{ gridTemplateColumns: `repeat(${ladder.length}, minmax(0, 1fr))` }}
						>
							{ladder.map((step) => {
								const state = step.order < currentOrder ? 'done' : step.order === currentOrder ? 'current' : 'locked';
								return (
									<li
										key={`${step.order}-${step.id}`}
										data-state={state}
										aria-current={state === 'current' ? 'step' : undefined}
										className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-[11px] leading-tight ${
											state === 'current'
												? 'bg-primary/15 text-base-content outline outline-1 outline-primary/60'
												: state === 'done'
													? 'bg-base-content/5 text-base-content/80'
													: 'bg-base-content/5 text-base-content/45'
										}`}
									>
										<TierEmblem tier={step.id} className={`h-6 w-6 ${state === 'locked' ? 'opacity-40 grayscale-[0.6]' : ''}`} />
										<span className="font-semibold max-sm:sr-only">{step.name}</span>
										<span className="tabular-nums">
											<LadderLabel step={step} ladder={ladder} />
										</span>
									</li>
								);
							})}
						</ol>
					) : null}
				</>
			) : null}

			{ranked.length > 0 ? (
				<div className={tier ? 'mt-5 border-t border-base-content/10 pt-4' : ''}>
					<p className="mb-2 text-sm font-semibold text-base-content/60">Also ranked in</p>
					<ul className="flex flex-wrap gap-2">
						{ranked.map((other) => (
							<li key={other.banListName}>
								<a
									href={profileHref(userId, other.banListName, username, season)}
									className="flex items-center gap-2 rounded-full border border-base-content/15 px-3 py-1 text-sm transition-colors hover:border-primary hover:bg-primary/10"
								>
									<TierEmblem tier={other.tier.id} className="h-5 w-5" />
									<span className="font-semibold">{other.banListName}</span>
									<span className="text-base-content/60">{other.tier.name}</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			) : null}
		</section>
	);
}
