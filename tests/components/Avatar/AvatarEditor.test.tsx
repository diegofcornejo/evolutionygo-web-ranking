import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { session } from '@stores/sessionStore';
import { avatars, getAvatar, saveAvatar } from '@stores/avatarStore';
import { DEFAULT_AVATAR, avatarDataUri } from '@utils/avatar';
import AvatarEditor from '@components/Avatar/AvatarEditor';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

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
		saveAvatar('1', look);
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

	it('saves the look for the logged-in player and closes', () => {
		render(<AvatarEditor dialog="dialog-avatar" />);
		fireEvent.click(screen.getByRole('tab', { name: 'Shirt' }));
		fireEvent.click(screen.getByRole('radio', { name: 'EVO' }));
		fireEvent.click(screen.getByRole('button', { name: 'Save' }));
		expect(getAvatar('1')).toEqual({ ...DEFAULT_AVATAR, shirtLogo: 'evo' });
		expect(toast.success).toHaveBeenCalled();
		expect((document.getElementById('dialog-avatar') as HTMLDialogElement).close).toHaveBeenCalled();
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

	it('goes back to initials', () => {
		saveAvatar('1', DEFAULT_AVATAR);
		render(<AvatarEditor dialog="dialog-avatar" />);
		fireEvent.click(screen.getByRole('button', { name: 'Use initials' }));
		expect(getAvatar('1')).toBeNull();
	});

	it('hides the initials option when there is nothing saved', () => {
		render(<AvatarEditor dialog="dialog-avatar" />);
		expect(screen.queryByRole('button', { name: 'Use initials' })).not.toBeInTheDocument();
	});
});
