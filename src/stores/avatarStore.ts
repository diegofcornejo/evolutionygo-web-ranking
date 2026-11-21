import { persistentAtom } from '@nanostores/persistent';
import { avatarDataUri, sanitizeAvatar, type AvatarConfig } from '@utils/avatar';

// Saved in the browser until the API can store avatars; keyed by user id so
// several accounts on one browser keep their own look.
const decode = (raw: string): Record<string, AvatarConfig> => {
	try {
		const value = JSON.parse(raw);
		return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
	} catch {
		return {};
	}
};

export const avatars = persistentAtom<Record<string, AvatarConfig>>('avatars', {}, {
	encode: JSON.stringify,
	decode,
});

export const getAvatar = (userId: string): AvatarConfig | null => {
	const saved = avatars.get()[userId];
	return saved ? sanitizeAvatar(saved) : null;
};

export const saveAvatar = (userId: string, config: AvatarConfig) => {
	if (!userId) return;
	avatars.set({ ...avatars.get(), [userId]: sanitizeAvatar(config) });
};

export const clearAvatar = (userId: string) => {
	const { [userId]: _removed, ...rest } = avatars.get();
	avatars.set(rest);
};

export const ownAvatarSrc = (userId: string, username: string) => {
	const saved = getAvatar(userId);
	return saved ? avatarDataUri(saved) : `https://ui-avatars.com/api/?name=${username}&background=random&size=128`;
};
