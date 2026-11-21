import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { toast } from 'sonner';
import { avatars, clearAvatar, saveAvatar } from '@stores/avatarStore';
import { session } from '@stores/sessionStore';
import {
	AVATAR_OPTIONS,
	DEFAULT_AVATAR,
	avatarDataUri,
	randomAvatar,
	sanitizeAvatar,
	type AvatarConfig,
	type AvatarPart,
	type AvatarWriteResult,
} from '@utils/avatar';

const SESSION_EXPIRED = 'Your session expired. Log in again to save your avatar.';

type Group = {
	part: AvatarPart;
	label: string;
	kind: 'swatch' | 'thumb';
	// Thumbnails zoom in where the option shows, so eyes and logos are not lost in a full bust.
	focus?: 'face' | 'chest';
	visible?: (look: AvatarConfig) => boolean;
};

const COLORED_HATS = new Set<AvatarConfig['headwear']>(['cap', 'beanie', 'headband', 'wizard', 'tophat']);

const TABS: { id: string; label: string; groups: Group[] }[] = [
	{
		id: 'face',
		label: 'Face',
		groups: [
			{ part: 'skinTone', label: 'Skin tone', kind: 'swatch' },
			{ part: 'eyeStyle', label: 'Eyes', kind: 'thumb', focus: 'face' },
			{
				part: 'eyeColor',
				label: 'Eye color',
				kind: 'swatch',
				visible: (look) => look.eyeStyle !== 'happy',
			},
		],
	},
	{
		id: 'hair',
		label: 'Hair',
		groups: [
			{ part: 'hairStyle', label: 'Style', kind: 'thumb' },
			{ part: 'hairColor', label: 'Color', kind: 'swatch', visible: (look) => look.hairStyle !== 'bald' },
		],
	},
	{
		id: 'accessories',
		label: 'Accessories',
		groups: [
			{ part: 'eyewear', label: 'Glasses', kind: 'thumb', focus: 'face' },
			{ part: 'headwear', label: 'Hat', kind: 'thumb' },
			{
				part: 'headwearColor',
				label: 'Hat color',
				kind: 'swatch',
				visible: (look) => COLORED_HATS.has(look.headwear),
			},
		],
	},
	{
		id: 'shirt',
		label: 'Shirt',
		groups: [
			{ part: 'shirtColor', label: 'Color', kind: 'swatch' },
			{ part: 'shirtLogo', label: 'Logo', kind: 'thumb', focus: 'chest' },
		],
	},
	{
		id: 'background',
		label: 'Background',
		groups: [{ part: 'background', label: 'Color', kind: 'swatch' }],
	},
];

const FOCUS_CLASS = {
	face: 'scale-[1.9] origin-[50%_46%]',
	chest: 'scale-[2.2] origin-[50%_92%]',
} as const;

const userIdFrom = (raw: string) => {
	try {
		return (JSON.parse(raw || '{}')?.user?.id as string | undefined) ?? '';
	} catch {
		return '';
	}
};

const closeDialog = (dialog: string) => {
	(document.getElementById(dialog) as HTMLDialogElement | null)?.close();
};

interface FormProps {
	dialog: string;
	userId: string;
	saved: AvatarConfig | null;
}

function AvatarForm({ dialog, userId, saved }: Readonly<FormProps>) {
	const [look, setLook] = useState<AvatarConfig>(saved ?? DEFAULT_AVATAR);
	const [tab, setTab] = useState(TABS[0].id);
	const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];

	const pick = (part: AvatarPart, id: string) => setLook((current) => sanitizeAvatar({ ...current, [part]: id }));

	const [busy, setBusy] = useState(false);

	const reportFailure = (result: AvatarWriteResult, failed: string) => {
		toast.error(result === 'unauthorized' ? SESSION_EXPIRED : failed);
	};

	const handleSave = async () => {
		setBusy(true);
		const result = await saveAvatar(userId, look);
		setBusy(false);
		if (result !== 'ok') {
			reportFailure(result, 'Could not save your avatar. Try again.');
			return;
		}
		toast.success('Avatar saved');
		closeDialog(dialog);
	};

	const handleUseInitials = async () => {
		setBusy(true);
		const result = await clearAvatar(userId);
		setBusy(false);
		if (result !== 'ok') {
			reportFailure(result, 'Could not remove your avatar. Try again.');
			return;
		}
		toast.success('Back to your initials');
		closeDialog(dialog);
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col md:flex-row gap-6">
				<div className="flex flex-col items-center gap-3 md:w-44 shrink-0">
					<img
						src={avatarDataUri(look)}
						alt="Avatar preview"
						className="w-36 h-36 md:w-40 md:h-40 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-base-100"
					/>
					<button type="button" className="btn btn-sm btn-ghost" onClick={() => setLook(randomAvatar())}>
						Randomize
					</button>
				</div>

				<div className="flex-1 min-w-0">
					<div role="tablist" aria-label="Avatar parts" className="tabs tabs-box tabs-sm flex-nowrap overflow-x-auto">
						{TABS.map((t) => (
							<button
								key={t.id}
								type="button"
								role="tab"
								id={`avatar-tab-${t.id}`}
								aria-selected={t.id === tab}
								aria-controls="avatar-tabpanel"
								className={`tab whitespace-nowrap ${t.id === tab ? 'tab-active' : ''}`}
								onClick={() => setTab(t.id)}
							>
								{t.label}
							</button>
						))}
					</div>

					<div
						role="tabpanel"
						id="avatar-tabpanel"
						aria-labelledby={`avatar-tab-${activeTab.id}`}
						className="mt-4 space-y-4 md:min-h-72"
					>
						{activeTab.groups
							.filter((group) => group.visible?.(look) ?? true)
							.map((group) => (
								<OptionGroup key={group.part} group={group} look={look} onPick={pick} />
							))}
					</div>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				{saved && (
					<button
						type="button"
						className="btn btn-sm btn-ghost text-base-content/70"
						onClick={handleUseInitials}
						disabled={busy}
					>
						Use initials
					</button>
				)}
				<div className="flex gap-2 ml-auto">
					<button type="button" className="btn btn-ghost" onClick={() => closeDialog(dialog)}>
						Cancel
					</button>
					<button type="button" className="btn btn-primary" onClick={handleSave} disabled={busy}>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}

interface OptionGroupProps {
	group: Group;
	look: AvatarConfig;
	onPick: (part: AvatarPart, id: string) => void;
}

function OptionGroup({ group, look, onPick }: Readonly<OptionGroupProps>) {
	const options = AVATAR_OPTIONS[group.part] as readonly { id: string; label: string; hex?: string }[];
	return (
		<div>
			<p className="text-sm font-semibold mb-2" id={`avatar-group-${group.part}`}>
				{group.label}
			</p>
			<div role="radiogroup" aria-labelledby={`avatar-group-${group.part}`} className="flex flex-wrap gap-2">
				{options.map((option) => {
					const selected = look[group.part] === option.id;
					if (group.kind === 'swatch') {
						return (
							<button
								key={option.id}
								type="button"
								role="radio"
								aria-checked={selected}
								aria-label={option.label}
								title={option.label}
								onClick={() => onPick(group.part, option.id)}
								className={`w-8 h-8 rounded-full border-2 border-base-content/20 cursor-pointer transition-transform hover:scale-110 ${
									selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100' : ''
								}`}
								style={{ backgroundColor: option.hex }}
							/>
						);
					}
					return (
						<button
							key={option.id}
							type="button"
							role="radio"
							aria-checked={selected}
							aria-label={option.label}
							title={option.label}
							onClick={() => onPick(group.part, option.id)}
							className={`w-14 h-14 rounded-xl overflow-hidden cursor-pointer bg-base-300 transition-transform hover:scale-105 ${
								selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100' : 'opacity-80 hover:opacity-100'
							}`}
						>
							<img
								src={avatarDataUri({ ...look, [group.part]: option.id })}
								alt=""
								className={`w-full h-full ${group.focus ? FOCUS_CLASS[group.focus] : ''}`}
							/>
						</button>
					);
				})}
			</div>
		</div>
	);
}

export default function AvatarEditor({ dialog }: Readonly<{ dialog: string }>) {
	const userId = userIdFrom(useStore(session));
	const stored = useStore(avatars)[userId];
	const saved = userId && stored ? sanitizeAvatar(stored) : null;
	const [resets, setResets] = useState(0);

	// Closing the dialog (✕, backdrop, ESC, Cancel, Save) drops unsaved changes.
	useEffect(() => {
		const modal = document.getElementById(dialog);
		if (!modal) return;
		const handleClose = () => setResets((n) => n + 1);
		modal.addEventListener('close', handleClose);
		return () => modal.removeEventListener('close', handleClose);
	}, [dialog]);

	return <AvatarForm key={`${userId}:${resets}:${JSON.stringify(saved)}`} dialog={dialog} userId={userId} saved={saved} />;
}
