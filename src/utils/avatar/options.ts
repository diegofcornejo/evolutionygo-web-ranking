const CLOTH_COLORS = [
	{ id: 'white', label: 'White', hex: '#eef0f3', ink: '#23262d' },
	{ id: 'black', label: 'Black', hex: '#25272e', ink: '#ffffff' },
	{ id: 'gray', label: 'Gray', hex: '#7c8491', ink: '#ffffff' },
	{ id: 'red', label: 'Red', hex: '#d63a3a', ink: '#ffffff' },
	{ id: 'orange', label: 'Orange', hex: '#ee7d24', ink: '#ffffff' },
	{ id: 'yellow', label: 'Yellow', hex: '#f3c536', ink: '#23262d' },
	{ id: 'green', label: 'Green', hex: '#3aa35b', ink: '#ffffff' },
	{ id: 'teal', label: 'Teal', hex: '#1d9e9e', ink: '#ffffff' },
	{ id: 'blue', label: 'Blue', hex: '#2f6fd6', ink: '#ffffff' },
	{ id: 'navy', label: 'Navy', hex: '#26386d', ink: '#ffffff' },
	{ id: 'purple', label: 'Purple', hex: '#7d4fd6', ink: '#ffffff' },
	{ id: 'pink', label: 'Pink', hex: '#e86aa8', ink: '#ffffff' },
] as const;

export const AVATAR_OPTIONS = {
	skinTone: [
		{ id: 'porcelain', label: 'Porcelain', hex: '#fde3cf' },
		{ id: 'light', label: 'Light', hex: '#f3c9a8' },
		{ id: 'medium', label: 'Medium', hex: '#e0aa7e' },
		{ id: 'tan', label: 'Tan', hex: '#c68a5a' },
		{ id: 'brown', label: 'Brown', hex: '#965f3d' },
		{ id: 'deep', label: 'Deep', hex: '#64402a' },
	],
	hairStyle: [
		{ id: 'bald', label: 'Bald' },
		{ id: 'buzz', label: 'Buzz cut' },
		{ id: 'short', label: 'Short' },
		{ id: 'slick', label: 'Slicked back' },
		{ id: 'sidepart', label: 'Side swept' },
		{ id: 'messy', label: 'Messy' },
		{ id: 'spiky', label: 'Spiky' },
		{ id: 'mohawk', label: 'Mohawk' },
		{ id: 'curly', label: 'Curly' },
		{ id: 'afro', label: 'Afro' },
		{ id: 'bob', label: 'Bob' },
		{ id: 'long', label: 'Long' },
		{ id: 'centerpart', label: 'Long, center part' },
		{ id: 'ponytail', label: 'Ponytail' },
		{ id: 'bun', label: 'Bun' },
		{ id: 'pigtails', label: 'Pigtails' },
	],
	hairColor: [
		{ id: 'black', label: 'Black', hex: '#1f1b1a' },
		{ id: 'dark-brown', label: 'Dark brown', hex: '#4a2f22' },
		{ id: 'brown', label: 'Brown', hex: '#80502e' },
		{ id: 'blonde', label: 'Blonde', hex: '#e3bd5c' },
		{ id: 'platinum', label: 'Platinum', hex: '#ece3cb' },
		{ id: 'ginger', label: 'Ginger', hex: '#c4552b' },
		{ id: 'gray', label: 'Gray', hex: '#9a9da3' },
		{ id: 'blue', label: 'Blue', hex: '#3b6fe0' },
		{ id: 'pink', label: 'Pink', hex: '#e86aa8' },
		{ id: 'purple', label: 'Purple', hex: '#7d4fd6' },
		{ id: 'green', label: 'Green', hex: '#3fa36b' },
		{ id: 'red', label: 'Red', hex: '#c62828' },
	],
	eyeStyle: [
		{ id: 'round', label: 'Round' },
		{ id: 'big', label: 'Big' },
		{ id: 'sharp', label: 'Sharp' },
		{ id: 'sleepy', label: 'Sleepy' },
		{ id: 'happy', label: 'Happy' },
		{ id: 'wink', label: 'Wink' },
	],
	eyeColor: [
		{ id: 'brown', label: 'Brown', hex: '#6b3e26' },
		{ id: 'hazel', label: 'Hazel', hex: '#8e7618' },
		{ id: 'green', label: 'Green', hex: '#2e8b57' },
		{ id: 'blue', label: 'Blue', hex: '#2f6fd6' },
		{ id: 'gray', label: 'Gray', hex: '#7a8a99' },
		{ id: 'amber', label: 'Amber', hex: '#d18a1c' },
		{ id: 'violet', label: 'Violet', hex: '#8a4fd1' },
		{ id: 'red', label: 'Red', hex: '#c62828' },
	],
	eyewear: [
		{ id: 'none', label: 'None' },
		{ id: 'round', label: 'Round glasses' },
		{ id: 'square', label: 'Square glasses' },
		{ id: 'sunglasses', label: 'Sunglasses' },
		{ id: 'monocle', label: 'Monocle' },
	],
	headwear: [
		{ id: 'none', label: 'None' },
		{ id: 'cap', label: 'Cap' },
		{ id: 'beanie', label: 'Beanie' },
		{ id: 'headband', label: 'Headband' },
		{ id: 'wizard', label: 'Wizard hat' },
		{ id: 'tophat', label: 'Top hat' },
		{ id: 'crown', label: 'Crown' },
	],
	headwearColor: CLOTH_COLORS,
	shirtColor: CLOTH_COLORS,
	shirtLogo: [
		{ id: 'none', label: 'None' },
		{ id: 'evolution', label: 'Evolution' },
		{ id: 'evo', label: 'EVO' },
		{ id: 'star', label: 'Star' },
		{ id: 'bolt', label: 'Bolt' },
		{ id: 'heart', label: 'Heart' },
		{ id: 'flame', label: 'Flame' },
		{ id: 'card', label: 'Card' },
	],
	background: [
		{ id: 'night', label: 'Night', hex: '#1d2333' },
		{ id: 'slate', label: 'Slate', hex: '#3b4252' },
		{ id: 'plum', label: 'Plum', hex: '#4c3a75' },
		{ id: 'blue', label: 'Blue', hex: '#2a5aa8' },
		{ id: 'teal', label: 'Teal', hex: '#1c7c7c' },
		{ id: 'green', label: 'Green', hex: '#2f7a45' },
		{ id: 'gold', label: 'Gold', hex: '#d9a62e' },
		{ id: 'red', label: 'Red', hex: '#a33a3a' },
		{ id: 'pink', label: 'Pink', hex: '#d77aa6' },
		{ id: 'sky', label: 'Sky', hex: '#8ec5ea' },
	],
} as const;

type Options = typeof AVATAR_OPTIONS;

export type AvatarPart = keyof Options;

export type AvatarConfig = { [K in AvatarPart]: Options[K][number]['id'] };

export const DEFAULT_AVATAR: AvatarConfig = {
	skinTone: 'light',
	hairStyle: 'short',
	hairColor: 'dark-brown',
	eyeStyle: 'round',
	eyeColor: 'brown',
	eyewear: 'none',
	headwear: 'none',
	headwearColor: 'red',
	shirtColor: 'blue',
	shirtLogo: 'none',
	background: 'slate',
};

const PARTS = Object.keys(AVATAR_OPTIONS) as AvatarPart[];

const isOption = (part: AvatarPart, value: unknown) =>
	(AVATAR_OPTIONS[part] as readonly { id: string }[]).some((option) => option.id === value);

export const sanitizeAvatar = (value: unknown): AvatarConfig => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...DEFAULT_AVATAR };
	const input = value as Record<string, unknown>;
	const result = { ...DEFAULT_AVATAR } as Record<AvatarPart, string>;
	for (const part of PARTS) {
		if (isOption(part, input[part])) result[part] = input[part] as string;
	}
	return result as AvatarConfig;
};

export const randomAvatar = (rng: () => number = Math.random): AvatarConfig => {
	const result = {} as Record<AvatarPart, string>;
	for (const part of PARTS) {
		const options = AVATAR_OPTIONS[part];
		result[part] = options[Math.min(options.length - 1, Math.floor(rng() * options.length))].id;
	}
	return result as AvatarConfig;
};

export const optionHex = (part: AvatarPart, id: string): string => {
	const option = (AVATAR_OPTIONS[part] as readonly { id: string; hex?: string }[]).find((o) => o.id === id);
	return option?.hex ?? '';
};

export const clothInk = (id: string): string => CLOTH_COLORS.find((color) => color.id === id)?.ink ?? '#ffffff';
