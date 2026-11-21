import { persistentAtom } from '@nanostores/persistent';
import { getSession } from '@stores/sessionStore';
import {
	avatarDataUri,
	deleteMyAvatar,
	fetchMyAvatar,
	putMyAvatar,
	sanitizeAvatar,
	type AvatarConfig,
	type AvatarWriteResult,
} from '@utils/avatar';

// The API is the source of truth; this browser copy, keyed by user id, lets the navbar draw the
// avatar before the API answers and keeps it when the API is down.
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

// Users this browser has already reconciled with the API. Only before that first sync can a cached
// avatar be one the API never had (made before it could store them); afterwards a cached avatar the
// API does not have was deleted elsewhere and must not come back.
export const avatarsSynced = persistentAtom<string[]>('avatars-synced', [], {
	encode: JSON.stringify,
	decode: (raw) => {
		try {
			const value = JSON.parse(raw);
			return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
		} catch {
			return [];
		}
	},
});

const markSynced = (userId: string) => {
	if (!avatarsSynced.get().includes(userId)) avatarsSynced.set([...avatarsSynced.get(), userId]);
};

const cache = (userId: string, config: AvatarConfig | null) => {
	const { [userId]: _previous, ...rest } = avatars.get();
	avatars.set(config ? { ...rest, [userId]: sanitizeAvatar(config) } : rest);
};

export const getAvatar = (userId: string): AvatarConfig | null => {
	const saved = avatars.get()[userId];
	return saved ? sanitizeAvatar(saved) : null;
};

export const syncOwnAvatar = async (): Promise<void> => {
	const { isLoggedIn, token, user } = getSession();
	if (!isLoggedIn || !token || !user?.id) return;

	const remote = await fetchMyAvatar(token);
	if (remote === undefined) return;
	const firstSync = !avatarsSynced.get().includes(user.id);
	if (remote) {
		cache(user.id, remote);
		markSynced(user.id);
		return;
	}
	const local = getAvatar(user.id);
	if (!local) {
		markSynced(user.id);
	} else if (firstSync) {
		// Made before the API could store avatars: it lives only in this browser, upload it once.
		if ((await putMyAvatar(token, local)) === 'ok') markSynced(user.id);
	} else {
		cache(user.id, null);
	}
};

export const saveAvatar = async (userId: string, config: AvatarConfig): Promise<AvatarWriteResult> => {
	if (!userId) return 'unauthorized';
	const saved = await putMyAvatar(getSession().token, sanitizeAvatar(config));
	if (saved === 'ok') {
		cache(userId, config);
		markSynced(userId);
	}
	return saved;
};

export const clearAvatar = async (userId: string): Promise<AvatarWriteResult> => {
	const cleared = await deleteMyAvatar(getSession().token);
	if (cleared === 'ok') {
		cache(userId, null);
		markSynced(userId);
	}
	return cleared;
};

export const ownAvatarSrc = (userId: string, username: string) => {
	const saved = getAvatar(userId);
	return saved ? avatarDataUri(saved) : `https://ui-avatars.com/api/?name=${username}&background=random&size=128`;
};
