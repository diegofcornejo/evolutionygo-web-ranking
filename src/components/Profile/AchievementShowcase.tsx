import { useMemo, useRef } from 'react';
import type { Achievement, AchievementCatalogItem, AchievementProgress } from '@types';

interface AchievementShowcaseProps {
	achievements: Achievement[];
	catalog?: AchievementCatalogItem[];
	progress?: AchievementProgress | null;
}

interface LockedAchievement extends AchievementCatalogItem {
	current: number | null;
	target: number | null;
}

const PREVIEW_LIMIT = 3;

export function getRequirementProgress(
	item: AchievementCatalogItem,
	progress: AchievementProgress | null | undefined,
): { current: number | null; target: number | null } {
	const { requirement } = item;
	if (!requirement) return { current: null, target: null };
	if (!progress) return { current: null, target: requirement.target };

	const current =
		requirement.metric === 'ladderFirstWin'
			? Number(Boolean(requirement.ladder && progress.hasRankedWinByLadder[requirement.ladder]))
			: progress[requirement.metric];

	return { current: Math.min(current, requirement.target), target: requirement.target };
}

const completion = ({ current, target }: LockedAchievement) =>
	current === null || !target ? -1 : current / target;

export default function AchievementShowcase({
	achievements,
	catalog = [],
	progress = null,
}: Readonly<AchievementShowcaseProps>) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	const locked = useMemo<LockedAchievement[]>(() => {
		const unlockedIds = new Set(achievements.map((achievement) => achievement.id));
		return catalog
			.filter((item) => !unlockedIds.has(item.id))
			.map((item) => ({ ...item, ...getRequirementProgress(item, progress) }))
			.sort((a, b) => completion(b) - completion(a));
	}, [achievements, catalog, progress]);

	const sortedAchievements = useMemo(
		() => [...achievements].sort((a, b) => Date.parse(b.unlockedAt) - Date.parse(a.unlockedAt)),
		[achievements],
	);

	const totalPoints = achievements.reduce((sum, a) => sum + a.earnedPoints, 0);
	const totalAvailable = achievements.length + locked.length;
	const [latestAchievement, ...olderAchievements] = sortedAchievements;
	const visibleAchievements = olderAchievements.slice(0, PREVIEW_LIMIT);
	const shownCount = visibleAchievements.length + 1;
	const hasMore = achievements.length > shownCount || locked.length > 0;

	if (achievements.length === 0) {
		return (
			<div className="bg-base-200/50 rounded-2xl p-8 text-center border border-base-300">
				<div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-warning/10 flex items-center justify-center">
					<span className="text-sm font-semibold text-warning">Locked</span>
				</div>
				<h3 className="text-xl font-semibold mb-2">No Achievements Yet</h3>
				<p className="text-base-content/60">Keep dueling ranked matches to unlock achievements.</p>

				{locked.length > 0 && (
					<div className="border-t border-base-300 pt-6 mt-6 text-left">
						<p className="text-sm text-base-content/50 mb-4 text-center">Achievements you can unlock:</p>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							{locked.slice(0, PREVIEW_LIMIT).map((item) => (
								<LockedAchievementCard key={item.id} achievement={item} />
							))}
						</div>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary */}
			<div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gradient-to-r from-warning/10 to-transparent rounded-xl border border-warning/20">
				<div className="shrink-0">
					<span className="text-base-content/60 text-sm">Unlocked</span>
					<div className="text-2xl font-bold text-warning">
						{achievements.length}
						{locked.length > 0 && (
							<span className="text-base font-medium text-base-content/50"> / {totalAvailable}</span>
						)}
					</div>
					{totalPoints > 0 && (
						<span className="text-xs text-base-content/60">{totalPoints.toLocaleString()} achievement points</span>
					)}
				</div>
				<LatestAchievement achievement={latestAchievement} />
			</div>

			{/* Achievement Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{visibleAchievements.map((achievement, index) => (
					<AchievementCard key={achievement.awardId ?? `${achievement.id}-${index}`} achievement={achievement} />
				))}
			</div>

			{hasMore && (
				<div className="mt-4 flex items-center justify-between">
					<span className="text-sm text-base-content/50">
						Showing {shownCount} of {totalAvailable}
					</span>
					<button
						type="button"
						className="btn btn-sm btn-outline"
						onClick={() => dialogRef.current?.showModal()}
					>
						View all
					</button>
				</div>
			)}

			<dialog ref={dialogRef} className="modal">
				<div className="modal-box max-w-4xl bg-[#13151a] border border-white/30 shadow-2xl">
					<header className="flex items-center justify-between gap-4 mb-4">
						<h3 className="text-2xl font-bold">All Achievements</h3>
						<button
							type="button"
							className="btn btn-sm btn-circle btn-ghost"
							aria-label="Close"
							onClick={() => dialogRef.current?.close()}
						>
							<svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
								<path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
							</svg>
						</button>
					</header>
					<div className="max-h-[70vh] overflow-y-auto pr-1 space-y-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{sortedAchievements.map((achievement, index) => (
								<AchievementCard
									key={`modal-${achievement.awardId ?? `${achievement.id}-${index}`}`}
									achievement={achievement}
								/>
							))}
						</div>
						{locked.length > 0 && (
							<div>
								<p className="text-sm font-semibold text-base-content/60 mb-3">Locked</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
									{locked.map((item) => (
										<LockedAchievementCard key={`modal-locked-${item.id}`} achievement={item} />
									))}
								</div>
							</div>
						)}
					</div>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button type="submit">close</button>
				</form>
			</dialog>
		</div>
	);
}

function AchievementIcon({ icon, muted = false }: Readonly<{ icon: string; muted?: boolean }>) {
	return (
		<div
			aria-hidden="true"
			className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl ${
				muted ? 'bg-base-300/60 grayscale opacity-50' : 'bg-warning/10'
			}`}
		>
			{icon}
		</div>
	);
}

function formatUnlockedDate(unlockedAt: string) {
	return new Date(unlockedAt).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

function LatestAchievement({ achievement }: Readonly<{ achievement: Achievement }>) {
	return (
		<div className="flex items-center gap-4 min-w-0 sm:pl-6 sm:border-l border-t sm:border-t-0 pt-4 sm:pt-0 border-warning/20">
			<AchievementIcon icon={achievement.icon} />
			<div className="min-w-0">
				<span className="text-xs uppercase tracking-wide text-warning/80">Latest unlock</span>
				<h3 className="font-bold leading-tight truncate">{achievement.name}</h3>
				<p className="text-xs text-base-content/50 truncate">
					{achievement.description} · {formatUnlockedDate(achievement.unlockedAt)}
				</p>
			</div>
		</div>
	);
}

function AchievementCard({ achievement }: Readonly<{ achievement: Achievement }>) {
	const unlockedDate = formatUnlockedDate(achievement.unlockedAt);

	return (
		<div className="group relative overflow-hidden rounded-2xl bg-base-200/80 border border-base-300 hover:border-warning/30 transition-all duration-300 hover:shadow-lg hover:shadow-warning/5">
			<div className="relative p-5">
				<div className="flex items-start gap-4 mb-4">
					<AchievementIcon icon={achievement.icon} />
					<div className="flex-1 min-w-0">
						<h3 className="font-bold text-base leading-tight wrap-break-word">{achievement.name}</h3>
						<p className="text-sm text-base-content/60 line-clamp-2">{achievement.description}</p>
					</div>
				</div>

				{achievement.earnedPoints > 0 && (
					<div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold mb-3 bg-warning/10 text-warning">
						+{achievement.earnedPoints} pts
					</div>
				)}

				<div className="flex items-center justify-between gap-2 pt-3 border-t border-base-300/50">
					<div className="flex flex-wrap gap-1">
						{achievement.labels.slice(0, 2).map((label) => (
							<span key={label} className="badge badge-ghost badge-xs">
								{label}
							</span>
						))}
						{achievement.season !== undefined && (
							<span className="badge badge-ghost badge-xs">Season {achievement.season}</span>
						)}
					</div>
					<span className="text-xs text-base-content/40 shrink-0">{unlockedDate}</span>
				</div>
			</div>
		</div>
	);
}

function LockedAchievementCard({ achievement }: Readonly<{ achievement: LockedAchievement }>) {
	const { current, target } = achievement;
	const showProgress = current !== null && target !== null && target > 1;

	return (
		<div className="rounded-2xl bg-base-300/30 border border-base-300/60 p-5">
			<div className="flex items-start gap-4">
				<AchievementIcon icon={achievement.icon} muted />
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-sm leading-tight text-base-content/70">{achievement.name}</h3>
					<p className="text-xs text-base-content/50 line-clamp-2">{achievement.description}</p>
				</div>
			</div>
			{showProgress && (
				<div className="mt-4">
					<progress
						className="progress progress-warning w-full h-1.5"
						value={current}
						max={target}
						aria-label={`${achievement.name} progress`}
					/>
					<p className="text-xs text-base-content/50 mt-1 text-right">
						{current} / {target}
					</p>
				</div>
			)}
		</div>
	);
}
