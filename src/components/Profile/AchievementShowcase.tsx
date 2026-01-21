import { useMemo, useRef } from 'react';
import type { Achievement } from '@types';

interface AchievementShowcaseProps {
	achievements: Achievement[];
}

// Mock data for when no achievements exist
const mockAchievements: Achievement[] = [
	{
		id: '1',
		icon: 'ic:round-emoji-events',
		name: 'First Victory',
		labels: ['Beginner', 'Combat'],
		unlockedAt: new Date('2024-01-15'),
		description: 'Win your first ranked duel',
		earnedPoints: 50,
		color: '#FFD700',
	},
	{
		id: '2',
		icon: 'ic:round-local-fire-department',
		name: 'Hot Streak',
		labels: ['Streak', 'Combat'],
		unlockedAt: new Date('2024-02-20'),
		description: 'Win 5 duels in a row',
		earnedPoints: 150,
		color: '#FF6B35',
	},
	{
		id: '3',
		icon: 'ic:round-star',
		name: 'Rising Star',
		labels: ['Ranking', 'Prestige'],
		unlockedAt: new Date('2024-03-10'),
		description: 'Reach Top 100 in the rankings',
		earnedPoints: 200,
		color: '#A855F7',
	},
];

export default function AchievementShowcase({ achievements }: Readonly<AchievementShowcaseProps>) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const displayAchievements = achievements.length > 0 ? achievements : [];
	const shouldDuplicateForPreview = import.meta.env.DEV && displayAchievements.length > 0 && displayAchievements.length <= 3;
	const renderedAchievements = useMemo(
		() => (shouldDuplicateForPreview ? [...displayAchievements, ...displayAchievements] : displayAchievements),
		[displayAchievements, shouldDuplicateForPreview],
	);
	const visibleAchievements = renderedAchievements.slice(0, 3);
	const totalPoints = displayAchievements.reduce((sum, a) => sum + a.earnedPoints, 0);
	const hasMore = renderedAchievements.length > 3;

	if (displayAchievements.length === 0) {
		return (
			<div className="bg-base-200/50 rounded-2xl p-8 text-center border border-base-300">
				<div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-warning/10 flex items-center justify-center">
					<span className="text-sm font-semibold text-warning">Locked</span>
				</div>
				<h3 className="text-xl font-semibold mb-2">No Achievements Yet</h3>
				<p className="text-base-content/60 mb-6">
					Keep dueling to unlock achievements and earn bonus points.
				</p>
				
				<div className="border-t border-base-300 pt-6 mt-6">
					<p className="text-sm text-base-content/50 mb-4">Achievements you can unlock:</p>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{mockAchievements.map((achievement) => (
							<div
								key={achievement.id}
								className="bg-base-300/30 rounded-xl p-4 opacity-50 grayscale"
							>
								<div className="w-10 h-10 rounded-lg bg-base-200/80 flex items-center justify-center mb-2">
									<span className="text-xs font-semibold text-base-content/60">LOCK</span>
								</div>
								<p className="font-medium text-sm">{achievement.name}</p>
								<p className="text-xs text-base-content/40">{achievement.earnedPoints} pts</p>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary */}
			<div className="flex items-center justify-between p-4 bg-gradient-to-r from-warning/10 to-transparent rounded-xl border border-warning/20">
				<div>
					<span className="text-base-content/60 text-sm">Achievement Points</span>
					<div className="text-2xl font-bold text-warning">{totalPoints.toLocaleString()}</div>
				</div>
				<div className="text-right">
					<span className="text-base-content/60 text-sm">Unlocked</span>
					<div className="text-2xl font-bold">{displayAchievements.length}</div>
				</div>
			</div>

			{/* Achievement Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{visibleAchievements.map((achievement, index) => (
					<AchievementCard key={`${achievement.id}-${index}`} achievement={achievement} />
				))}
			</div>

			{hasMore && (
				<div className="mt-4 flex items-center justify-between">
					<span className="text-sm text-base-content/50">
						Showing 3 of {renderedAchievements.length}
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
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto pr-1">
						{renderedAchievements.map((achievement, index) => (
							<AchievementCard key={`modal-${achievement.id}-${index}`} achievement={achievement} />
						))}
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

function AchievementCard({ achievement }: Readonly<{ achievement: Achievement }>) {
		const unlockedDate = new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});


	return (
		<div
			className="group relative overflow-hidden rounded-2xl bg-base-200/80 border border-base-300 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
		>
			{/* Glow effect */}
			<div
				className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
				style={{
					background: `radial-gradient(circle at 50% 0%, ${achievement.color}20, transparent 70%)`,
				}}
			/>

			<div className="relative p-5">
				{/* Icon and title */}
				<div className="flex items-start gap-4 mb-4">
					<div className="flex-1 min-w-0">
						<h3 className="font-bold text-base leading-tight wrap-break-words">
							{achievement.name}
						</h3>
						<p className="text-sm text-base-content/60 line-clamp-2">
							{achievement.description}
						</p>
					</div>
				</div>

				{/* Points badge */}
				<div
					className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold mb-3"
					style={{
						backgroundColor: `${achievement.color}20`,
						color: achievement.color,
					}}
				>
					+{achievement.earnedPoints} pts
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between pt-3 border-t border-base-300/50">
					<div className="flex flex-wrap gap-1">
						{achievement.labels.slice(0, 2).map((label) => (
							<span key={label} className="badge badge-ghost badge-xs">
								{label}
							</span>
						))}
					</div>
					<span className="text-xs text-base-content/40">{unlockedDate}</span>
				</div>
			</div>
		</div>
	);
}
