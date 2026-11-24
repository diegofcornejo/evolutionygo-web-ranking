import { useEffect, useState } from 'react';
import { getSession } from '@stores/sessionStore';
import { fetchAccountVerified, resendVerificationEmail, type ResendResult } from '@utils/emailVerification';

const RESEND_MESSAGES: Record<ResendResult, { text: string; className: string }> = {
	sent: { text: 'Email sent, check your inbox.', className: 'text-success' },
	throttled: { text: 'An email was sent a moment ago, wait a minute.', className: 'text-warning' },
	failed: { text: 'Could not send the email, try again later.', className: 'text-error' },
};

export default function AccountVerificationNotice({ dialog }: Readonly<{ dialog: string }>) {
	const [accountVerified, setAccountVerified] = useState<boolean | null>(null);
	const [sending, setSending] = useState(false);
	const [resendResult, setResendResult] = useState<ResendResult | null>(null);

	// The settings dialog is mounted on every page, so the status is asked for only when it
	// opens, and again on each open in case the player confirmed meanwhile.
	useEffect(() => {
		const element = document.getElementById(dialog);
		if (!(element instanceof HTMLElement)) return;

		let active = true;
		const refresh = async () => {
			const token = getSession().token;
			if (!token) return;
			const status = await fetchAccountVerified(token);
			if (active) setAccountVerified(status);
		};

		const observer = new MutationObserver(() => {
			if (element.hasAttribute('open')) {
				void refresh();
			} else {
				setResendResult(null);
			}
		});
		observer.observe(element, { attributes: true, attributeFilter: ['open'] });
		if (element.hasAttribute('open')) void refresh();

		return () => {
			active = false;
			observer.disconnect();
		};
	}, [dialog]);

	if (accountVerified !== false) return null;

	const handleResend = async () => {
		setSending(true);
		setResendResult(null);
		const result = await resendVerificationEmail(getSession().token);
		setResendResult(result);
		setSending(false);
	};

	const message = resendResult ? RESEND_MESSAGES[resendResult] : null;

	return (
		<div role="status" className="alert alert-warning alert-soft order-0 md:col-span-2 flex flex-col items-start gap-2">
			<p className="text-sm">Confirm your email to chat in rooms, play ranked and join tournaments.</p>
			<button type="button" className="btn btn-sm btn-warning" onClick={handleResend} disabled={sending}>
				{sending ? 'Sending...' : 'Resend email'}
			</button>
			{message ? <p className={`text-xs ${message.className}`}>{message.text}</p> : null}
		</div>
	);
}
