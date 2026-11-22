import { describe, expect, it, vi } from 'vitest';
import { EVODUEL_VERSION_URL, fetchEvoDuelVersion, parseEvoDuelVersion } from '@utils/evoDuelVersion';

describe('parseEvoDuelVersion', () => {
	it('reads the version the client deploy publishes', () => {
		expect(parseEvoDuelVersion({ version: '1.7.0', build: 'c975c67' })).toBe('1.7.0');
		expect(parseEvoDuelVersion({ version: '2.0.0-beta.1' })).toBe('2.0.0-beta.1');
	});

	it('rejects anything that is not a version number', () => {
		expect(parseEvoDuelVersion({ version: '<script>' })).toBeNull();
		expect(parseEvoDuelVersion({ version: 17 })).toBeNull();
		expect(parseEvoDuelVersion({})).toBeNull();
		expect(parseEvoDuelVersion(null)).toBeNull();
	});
});

describe('fetchEvoDuelVersion', () => {
	it('reads version.json from the EvoDuel site', async () => {
		const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ version: '1.7.0', build: 'c975c67' })));
		expect(await fetchEvoDuelVersion(fetchImpl)).toBe('1.7.0');
		expect(fetchImpl).toHaveBeenCalledWith(EVODUEL_VERSION_URL, expect.objectContaining({ signal: expect.any(AbortSignal) }));
		expect(EVODUEL_VERSION_URL).toBe('https://evoduel.com/version.json');
	});

	it('returns no version when the request fails, is not OK or is not JSON', async () => {
		expect(await fetchEvoDuelVersion(vi.fn().mockRejectedValue(new Error('offline')))).toBeNull();
		expect(await fetchEvoDuelVersion(vi.fn().mockResolvedValue(new Response('', { status: 404 })))).toBeNull();
		expect(await fetchEvoDuelVersion(vi.fn().mockResolvedValue(new Response('<!doctype html>')))).toBeNull();
	});
});
