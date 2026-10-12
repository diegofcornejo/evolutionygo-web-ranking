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

	const totalPoints = achievements.reduce((sum, a) => sum + a.earnedPoints, 0);
	const totalAvailable = achievements.length + locked.length;
	const visibleAchievements = achievements.slice(0, PREVIEW_LIMIT);
	const hasMore = achievements.length > PREVIEW_LIMIT || locked.length > 0;

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
			<div className="flex items-center justify-between p-4 bg-gradient-to-r from-warning/10 to-transparent rounded-xl border border-warning/20">
				<div>
					<span className="text-base-content/60 text-sm">Unlocked</span>
					<div className="text-2xl font-bold text-warning">
						{achievements.length}
						{locked.length > 0 && (
							<span className="text-base font-medium text-base-content/50"> / {totalAvailable}</span>
						)}
					</div>
				</div>
				{totalPoints > 0 && (
					<div className="text-right">
						<span className="text-base-content/60 text-sm">Achievement Points</span>
						<div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
					</div>
				)}
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
						Showing {visibleAchievements.length} of {totalAvailable}
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
					<h3 className="text-2xl font-bold mb-4">All Achievements</h3>
					<div className="max-h-[70vh] overflow-y-auto pr-1 space-y-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{achievements.map((achievement, index) => (
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
					<div className="modal-action">
						<button type="button" className="btn" onClick={() => dialogRef.current?.close()}>
							Close
						</button>
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

function AchievementCard({ achievement }: Readonly<{ achievement: Achievement }>) {
	const unlockedDate = new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});

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
