export type ResendResult = 'sent' | 'throttled' | 'failed';

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

// Resolves null when the status is unknown so callers can stay quiet instead of nagging on errors.
export async function fetchAccountVerified(token: string): Promise<boolean | null> {
	try {
		const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/users/email-verification`, {
			headers: authHeaders(token),
		});
		if (!response.ok) return null;
		const data = (await response.json().catch(() => ({}))) as {
			verified?: unknown;
			accountVerified?: unknown;
		};
		// Older API versions send only `verified`, the email flag.
		const flag = typeof data.accountVerified === 'boolean' ? data.accountVerified : data.verified;
		return typeof flag === 'boolean' ? flag : null;
	} catch {
		return null;
	}
}

export async function resendVerificationEmail(token: string): Promise<ResendResult> {
	try {
		const response = await fetch(
			`${import.meta.env.PUBLIC_API_URL}/users/email-verification/resend`,
			{ method: 'POST', headers: authHeaders(token) },
		);
		if (response.status === 429) return 'throttled';
		if (!response.ok) return 'failed';
		const data = (await response.json().catch(() => ({}))) as { sent?: unknown };
		return data.sent === true ? 'sent' : 'failed';
	} catch {
		return 'failed';
	}
}
