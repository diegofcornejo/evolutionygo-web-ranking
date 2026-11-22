import { sanitizeAvatar, type AvatarConfig } from './options';

const MAX_LOOKUP = 100;

/** 'unauthorized' means the login expired (the API only accepts tokens for a day): saving again will not help. */
export type AvatarWriteResult = 'ok' | 'unauthorized' | 'error';

const writeResult = (response: Response, okStatuses: number[] = []): AvatarWriteResult => {
	if (response.ok || okStatuses.includes(response.status)) return 'ok';
	return response.status === 401 ? 'unauthorized' : 'error';
};
const apiUrl = () => import.meta.env.PUBLIC_API_URL;

/** The player's saved avatar; null when they have none, undefined when the API could not say. */
export const fetchMyAvatar = async (token: string): Promise<AvatarConfig | null | undefined> => {
	try {
		const response = await fetch(`${apiUrl()}/me/avatar`, { headers: { Authorization: `Bearer ${token}` } });
		if (response.status === 404) return null;
		if (!response.ok) return undefined;
		const data = await response.json();
		return sanitizeAvatar(data?.config);
	} catch {
		return undefined;
	}
};

export const putMyAvatar = async (token: string, config: AvatarConfig): Promise<AvatarWriteResult> => {
	try {
		const response = await fetch(`${apiUrl()}/me/avatar`, {
			method: 'PUT',
			headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
			body: JSON.stringify(config),
		});
		return writeResult(response);
	} catch {
		return 'error';
	}
};

export const deleteMyAvatar = async (token: string): Promise<AvatarWriteResult> => {
	try {
		const response = await fetch(`${apiUrl()}/me/avatar`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		});
		return writeResult(response, [404]);
	} catch {
		return 'error';
	}
};

const fetchChunk = async (userIds: string[]): Promise<Record<string, AvatarConfig>> => {
	try {
		const response = await fetch(`${apiUrl()}/avatars?userIds=${encodeURIComponent(userIds.join(','))}`);
		if (!response.ok) return {};
		const data = await response.json();
		const avatars: { userId?: unknown; config?: unknown }[] = Array.isArray(data?.avatars) ? data.avatars : [];
		return Object.fromEntries(
			avatars
				.filter((entry) => typeof entry?.userId === 'string')
				.map((entry) => [entry.userId as string, sanitizeAvatar(entry.config)]),
		);
	} catch {
		return {};
	}
};

/** Public avatars by user id. Players without one, and any chunk that fails, are simply missing. */
export const fetchAvatars = async (userIds: readonly string[]): Promise<Record<string, AvatarConfig>> => {
	const chunks: string[][] = [];
	for (let i = 0; i < userIds.length; i += MAX_LOOKUP) chunks.push(userIds.slice(i, i + MAX_LOOKUP));
	const results = await Promise.all(chunks.map(fetchChunk));
	return Object.assign({}, ...results);
};
