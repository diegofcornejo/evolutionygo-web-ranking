import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { session } from '@stores/sessionStore';
import { avatars, getAvatar } from '@stores/avatarStore';
import { DEFAULT_AVATAR, avatarDataUri, deleteMyAvatar, putMyAvatar } from '@utils/avatar';
import AvatarEditor from '@components/Avatar/AvatarEditor';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@utils/avatar', async (importOriginal) => ({
	...(await importOriginal<typeof import('@utils/avatar')>()),
	putMyAvatar: vi.fn(async () => 'ok'),
	deleteMyAvatar: vi.fn(async () => 'ok'),
}));

const preview = () => screen.getByRole('img', { name: 'Avatar preview' }).getAttribute('src');

describe('AvatarEditor', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		avatars.set({});
		session.set(JSON.stringify({ isLoggedIn: true, token: 't', user: { id: '1', username: 'Ace' } }));
		document.body.innerHTML = '<dialog id="dialog-avatar"></dialog>';
		(document.getElementById('dialog-avatar') as HTMLDialogElement).close = vi.fn();
	});

	it('starts from the default look when the player has none', () => {
		render(<AvatarEditor dialog="dialog-avatar" />);
		expect(preview()).toBe(avatarDataUri(DEFAULT_AVATAR));
	});

	it('starts from the saved look', () => {
		const look = { ...DEFAULT_AVATAR, hairStyle: 'curly' as const };
		avatars.set({ '1': look });
		render(<AvatarEditor dialog="dialog-avatar" />);
		expect(preview()).toBe(avatarDataUri(look));
	});

	it('updates the preview as options are picked, across tabs', () => {
		render(<AvatarEditor dialog="dialog-avatar" />);
		fireEvent.click(screen.getByRole('tab', { name: 'Hair' }));
		fireEvent.click(screen.getByRole('radio', { name: 'Spiky' }));
		fireEvent.click(screen.getByRole('radio', { name: 'Purple' }));
		expect(preview()).toBe(avatarDataUri({ ...DEFAULT_AVATAR, hairStyle: 'spiky', hairColor: 'purple' }));
		expect(screen.getByRole('radio', { name: 'Spiky' })).toHaveAttribute('aria-checked', 'true');
	});

	it('saves the look for the logged-in player and closes', async () => {
		render(<AvatarEditor dialog="dialog-avatar" />);
		fireEvent.click(screen.getByRole('tab', { name: 'Shirt' }));
		fireEvent.click(screen.getByRole('radio', { name: 'EVO' }));
		fireEvent.click(screen.getByRole('button', { name: 'Save' }));
		await waitFor(() => expect(getAvatar('1')).toEqual({ ...DEFAULT_AVATAR, shirtLogo: 'evo' }));
		expect(putMyAvatar).toHaveBeenCalledWith('t', { ...DEFAULT_AVATAR, shirtLogo: 'evo' });
		expect(toast.success).toHaveBeenCalled();
		expect((document.getElementById('dialog-avatar') as HTMLDialogElement).close).toHaveBeenCalled();
	});

	it('keeps the previous avatar and shows an error when saving fails', async () => {
		vi.mocked(putMyAvatar).mockResolvedValueOnce('error');
		avatars.set({ '1': DEFAULT_AVATAR });
		render(<AvatarEditor dialog="dialog-avatar" />);
		fireEvent.click(screen.getByRole('tab', { name: 'Hair' }));
		fireEvent.click(screen.getByRole('radio', { name: 'Afro' }));
		fireEvent.click(screen.getByRole('button', { name: 'Save' }));
		await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Could not save your avatar. Try again.'));
		expect(getAvatar('1')).toEqual(DEFAULT_AVATAR);
		expect(preview()).toBe(avatarDataUri({ ...DEFAULT_AVATAR, hairStyle: 'afro' }));
		expect((document.getElementById('dialog-avatar') as HTMLDialogElement).close).not.toHaveBeenCalled();
	});

	it('asks the player to log in again when the session expired', async () => {
		vi.mocked(putMyAvatar).mockResolvedValueOnce('unauthorized');
		render(<AvatarEditor dialog="dialog-avatar" />);
		fireEvent.click(screen.getByRole('button', { name: 'Save' }));
		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith('Your session expired. Log in again to save your avatar.'),
		);
		expect((document.getElementById('dialog-avatar') as HTMLDialogElement).close).not.toHaveBeenCalled();
	});

	it('does not save until the player presses Save', () => {
		render(<AvatarEditor dialog="dialog-avatar" />);
		fireEvent.click(screen.getByRole('button', { name: 'Randomize' }));
		expect(getAvatar('1')).toBeNull();
	});

	it('drops unsaved changes when the dialog closes', () => {
		render(<AvatarEditor dialog="dialog-avatar" />);
		fireEvent.click(screen.getByRole('tab', { name: 'Hair' }));
		fireEvent.click(screen.getByRole('radio', { name: 'Bald' }));
		fireEvent(document.getElementById('dialog-avatar') as HTMLDialogElement, new Event('close'));
		expect(preview()).toBe(avatarDataUri(DEFAULT_AVATAR));
	});

	it('goes back to initials', async () => {
		avatars.set({ '1': DEFAULT_AVATAR });
		render(<AvatarEditor dialog="dialog-avatar" />);
		fireEvent.click(screen.getByRole('button', { name: 'Use initials' }));
		await waitFor(() => expect(getAvatar('1')).toBeNull());
		expect(deleteMyAvatar).toHaveBeenCalledWith('t');
	});

	it('hides the initials option when there is nothing saved', () => {
		render(<AvatarEditor dialog="dialog-avatar" />);
		expect(screen.queryByRole('button', { name: 'Use initials' })).not.toBeInTheDocument();
	});
});
