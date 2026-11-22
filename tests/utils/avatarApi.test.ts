import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DEFAULT_AVATAR, deleteMyAvatar, fetchAvatars, fetchMyAvatar, putMyAvatar } from '@utils/avatar';

const API = 'https://api.evolutionygo.com/api/v1';
const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

let fetchSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	fetchSpy = vi.spyOn(global, 'fetch');
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('fetchMyAvatar', () => {
	it('returns null when the player has none', async () => {
		fetchSpy.mockResolvedValue(json({ message: 'none' }, 404));
		expect(await fetchMyAvatar('t')).toBeNull();
		expect(fetchSpy).toHaveBeenCalledWith(`${API}/me/avatar`, { headers: { Authorization: 'Bearer t' } });
	});

	it('returns undefined when the answer is unknown', async () => {
		fetchSpy.mockResolvedValueOnce(json({}, 500));
		expect(await fetchMyAvatar('t')).toBeUndefined();
		fetchSpy.mockRejectedValueOnce(new Error('offline'));
		expect(await fetchMyAvatar('t')).toBeUndefined();
	});

	it('sanitizes the saved avatar', async () => {
		fetchSpy.mockResolvedValue(json({ config: { hairStyle: 'nope', hairColor: 'purple' } }));
		expect(await fetchMyAvatar('t')).toEqual({ ...DEFAULT_AVATAR, hairColor: 'purple' });
	});
});

describe('putMyAvatar', () => {
	it('sends the whole avatar with the token', async () => {
		fetchSpy.mockResolvedValue(json({ config: DEFAULT_AVATAR }));
		expect(await putMyAvatar('t', DEFAULT_AVATAR)).toBe('ok');
		expect(fetchSpy).toHaveBeenCalledWith(`${API}/me/avatar`, {
			method: 'PUT',
			headers: { Authorization: 'Bearer t', 'Content-Type': 'application/json' },
			body: JSON.stringify(DEFAULT_AVATAR),
		});
	});

	it('reports failures', async () => {
		fetchSpy.mockResolvedValueOnce(json({}, 400));
		expect(await putMyAvatar('t', DEFAULT_AVATAR)).toBe('error');
		fetchSpy.mockRejectedValueOnce(new Error('offline'));
		expect(await putMyAvatar('t', DEFAULT_AVATAR)).toBe('error');
	});

	it('tells an expired session apart from other failures', async () => {
		fetchSpy.mockResolvedValueOnce(json({}, 401));
		expect(await putMyAvatar('t', DEFAULT_AVATAR)).toBe('unauthorized');
	});
});

describe('deleteMyAvatar', () => {
	it('treats 204 and 404 as done', async () => {
		fetchSpy.mockResolvedValueOnce(new Response(null, { status: 204 }));
		expect(await deleteMyAvatar('t')).toBe('ok');
		fetchSpy.mockResolvedValueOnce(json({}, 404));
		expect(await deleteMyAvatar('t')).toBe('ok');
		expect(fetchSpy).toHaveBeenCalledWith(`${API}/me/avatar`, {
			method: 'DELETE',
			headers: { Authorization: 'Bearer t' },
		});
	});

	it('reports failures', async () => {
		fetchSpy.mockResolvedValueOnce(json({}, 500));
		expect(await deleteMyAvatar('t')).toBe('error');
		fetchSpy.mockResolvedValueOnce(json({}, 401));
		expect(await deleteMyAvatar('t')).toBe('unauthorized');
	});
});

describe('fetchAvatars', () => {
	it('makes no request for an empty list', async () => {
		expect(await fetchAvatars([])).toEqual({});
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('asks in chunks of 100 and merges the sanitized results', async () => {
		const ids = Array.from({ length: 150 }, (_, i) => `u${i}`);
		fetchSpy
			.mockResolvedValueOnce(json({ avatars: [{ userId: 'u1', config: { hairStyle: 'bob' } }] }))
			.mockResolvedValueOnce(json({ avatars: [{ userId: 'u120', config: { hairStyle: 'afro' } }] }));

		const result = await fetchAvatars(ids);

		expect(fetchSpy).toHaveBeenCalledTimes(2);
		expect(fetchSpy.mock.calls[0][0]).toBe(`${API}/avatars?userIds=${encodeURIComponent(ids.slice(0, 100).join(','))}`);
		expect(result).toEqual({
			u1: { ...DEFAULT_AVATAR, hairStyle: 'bob' },
			u120: { ...DEFAULT_AVATAR, hairStyle: 'afro' },
		});
	});

	it('returns what it could when a call fails', async () => {
		fetchSpy.mockRejectedValue(new Error('offline'));
		expect(await fetchAvatars(['u1'])).toEqual({});
		fetchSpy.mockResolvedValue(json({}, 500));
		expect(await fetchAvatars(['u1'])).toEqual({});
	});
});
