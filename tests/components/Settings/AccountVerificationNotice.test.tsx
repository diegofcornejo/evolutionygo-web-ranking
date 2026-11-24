import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor, act, cleanup } from '@testing-library/react';
import AccountVerificationNotice from '@components/Settings/AccountVerificationNotice';

vi.mock('@stores/sessionStore', () => ({
	getSession: vi.fn(() => ({ token: 'mock-token', isLoggedIn: true })),
}));

const API = import.meta.env.PUBLIC_API_URL;
const NOTICE = /confirm your email to chat in rooms, play ranked and join tournaments/i;

function jsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

function mountDialog(id: string) {
	const dialog = document.createElement('dialog');
	dialog.id = id;
	document.body.appendChild(dialog);
	return dialog;
}

async function openDialog(dialog: HTMLDialogElement) {
	await act(async () => {
		dialog.setAttribute('open', '');
	});
}

describe('AccountVerificationNotice', () => {
	const dialogId = 'dialog-settings-test';
	let dialog: HTMLDialogElement;

	beforeEach(() => {
		dialog = mountDialog(dialogId);
	});

	afterEach(() => {
		cleanup();
		dialog.remove();
		vi.restoreAllMocks();
	});

	it('shows the notice when accountVerified is false', async () => {
		const fetchMock = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(jsonResponse({ verified: false, accountVerified: false }));
		render(<AccountVerificationNotice dialog={dialogId} />);
		await openDialog(dialog);

		expect(await screen.findByText(NOTICE)).not.toBeNull();
		expect(screen.getByRole('button', { name: /resend email/i })).not.toBeNull();
		expect(fetchMock).toHaveBeenCalledWith(`${API}/users/email-verification`, {
			headers: { Authorization: 'Bearer mock-token' },
		});
	});

	it('stays hidden when accountVerified is true even if the email is not verified', async () => {
		const fetchMock = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(jsonResponse({ verified: false, accountVerified: true }));
		render(<AccountVerificationNotice dialog={dialogId} />);
		await openDialog(dialog);

		await waitFor(() => expect(fetchMock).toHaveBeenCalled());
		expect(screen.queryByText(NOTICE)).toBeNull();
	});

	it('falls back to verified when the API does not send accountVerified', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ verified: false }));
		render(<AccountVerificationNotice dialog={dialogId} />);
		await openDialog(dialog);

		expect(await screen.findByText(NOTICE)).not.toBeNull();
	});

	it('stays hidden when the API sends only verified true', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ verified: true }));
		render(<AccountVerificationNotice dialog={dialogId} />);
		await openDialog(dialog);

		await waitFor(() => expect(fetchMock).toHaveBeenCalled());
		expect(screen.queryByText(NOTICE)).toBeNull();
	});

	it('does not ask the API before the dialog opens', () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch');
		render(<AccountVerificationNotice dialog={dialogId} />);

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('resend button calls the resend endpoint and shows success', async () => {
		const fetchMock = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(jsonResponse({ verified: false, accountVerified: false }))
			.mockResolvedValueOnce(jsonResponse({ sent: true }));
		render(<AccountVerificationNotice dialog={dialogId} />);
		await openDialog(dialog);

		fireEvent.click(await screen.findByRole('button', { name: /resend email/i }));

		expect(await screen.findByText(/email sent/i)).not.toBeNull();
		expect(fetchMock).toHaveBeenLastCalledWith(`${API}/users/email-verification/resend`, {
			method: 'POST',
			headers: { Authorization: 'Bearer mock-token' },
		});
	});

	it('shows the throttle message when resend answers 429', async () => {
		vi.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(jsonResponse({ verified: false, accountVerified: false }))
			.mockResolvedValueOnce(jsonResponse({ message: 'Too many requests' }, 429));
		render(<AccountVerificationNotice dialog={dialogId} />);
		await openDialog(dialog);

		fireEvent.click(await screen.findByRole('button', { name: /resend email/i }));

		expect(await screen.findByText('An email was sent a moment ago, wait a minute.')).not.toBeNull();
	});
});
