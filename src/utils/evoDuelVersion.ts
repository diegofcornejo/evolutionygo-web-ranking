/**
 * The live EvoDuel release. The client repository is private, so every client deploy publishes
 * this file (evolution-card-game, `src/config/publicVersion.ts`) and the site reads it.
 */
export const EVODUEL_VERSION_URL = 'https://evoduel.com/version.json';

const FETCH_TIMEOUT_MS = 3000;
const VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/;

export function parseEvoDuelVersion(raw: unknown): string | null {
	if (typeof raw !== 'object' || raw === null) return null;
	const { version } = raw as { version?: unknown };
	return typeof version === 'string' && VERSION.test(version) ? version : null;
}

/** Any failure (offline, timeout, bad status, a page instead of JSON) yields no version. */
export async function fetchEvoDuelVersion(fetchImpl: typeof fetch = fetch): Promise<string | null> {
	try {
		const response = await fetchImpl(EVODUEL_VERSION_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
		if (!response.ok) return null;
		return parseEvoDuelVersion(await response.json());
	} catch {
		return null;
	}
}
